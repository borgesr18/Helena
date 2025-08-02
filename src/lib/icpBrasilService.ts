import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface ICPCertificate {
  serialNumber: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  type: 'A1' | 'A3' | 'A4' | 'S1' | 'S3' | 'S4';
  thumbprint: string;
}

export interface DigitalSignature {
  hash: string;
  signature: string;
  timestamp: Date;
  certificate: ICPCertificate;
}

export class ICPBrasilService {
  async validateCertificate(certificateData: string): Promise<ICPCertificate | null> {
    try {
      const mockCertificate: ICPCertificate = {
        serialNumber: '123456789',
        issuer: 'AC SERASA RFB v5',
        subject: 'Dr. João Silva:12345678901',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        type: 'A3',
        thumbprint: crypto.createHash('sha1').update(certificateData).digest('hex')
      };
      
      return mockCertificate;
    } catch (error) {
      console.error('Certificate validation error:', error);
      return null;
    }
  }

  async storeCertificate(userId: string, clinicaId: string | null, certificate: ICPCertificate): Promise<string> {
    const stored = await prisma.certificadoDigital.create({
      data: {
        user_id: userId,
        clinica_id: clinicaId,
        tipo_certificado: certificate.type,
        numero_serie: certificate.serialNumber,
        emissor: certificate.issuer,
        valido_ate: certificate.validTo,
        thumbprint: certificate.thumbprint,
        status: 'ativo'
      }
    });
    
    return stored.id;
  }

  async signDocument(documentHash: string, certificateId: string, userId: string): Promise<DigitalSignature> {
    const certificate = await prisma.certificadoDigital.findUnique({
      where: { id: certificateId }
    });
    
    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }
    
    if (certificate.user_id !== userId) {
      throw new Error('Certificado não pertence ao usuário');
    }
    
    if (new Date() > certificate.valido_ate) {
      throw new Error('Certificado expirado');
    }
    
    const signature = crypto
      .createHmac('sha256', certificate.thumbprint)
      .update(documentHash)
      .digest('hex');
    
    const digitalSignature: DigitalSignature = {
      hash: documentHash,
      signature,
      timestamp: new Date(),
      certificate: {
        serialNumber: certificate.numero_serie,
        issuer: certificate.emissor,
        subject: `User:${userId}`,
        validFrom: certificate.created_at,
        validTo: certificate.valido_ate,
        type: certificate.tipo_certificado as 'A1' | 'A3' | 'A4' | 'S1' | 'S3' | 'S4',
        thumbprint: certificate.thumbprint
      }
    };
    
    return digitalSignature;
  }

  async getUserCertificates(userId: string): Promise<ICPCertificate[]> {
    const certificates = await prisma.certificadoDigital.findMany({
      where: { 
        user_id: userId,
        status: 'ativo',
        valido_ate: { gt: new Date() }
      }
    });
    
    return certificates.map(cert => ({
      serialNumber: cert.numero_serie,
      issuer: cert.emissor,
      subject: `User:${userId}`,
      validFrom: cert.created_at,
      validTo: cert.valido_ate,
      type: cert.tipo_certificado as 'A1' | 'A3' | 'A4' | 'S1' | 'S3' | 'S4',
      thumbprint: cert.thumbprint
    }));
  }
}

export const icpBrasilService = new ICPBrasilService();
