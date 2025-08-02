export interface SBISPrescription {
  id: string;
  patientCpf: string;
  patientName: string;
  doctorCrm: string;
  doctorUf: string;
  medications: SBISMedication[];
  digitalSignature: string;
  timestamp: Date;
  validUntil: Date;
}

export interface SBISMedication {
  code: string; // Código ANVISA
  name: string;
  dosage: string;
  quantity: number;
  instructions: string;
  controlledSubstance: boolean;
}

export interface RNDSResponse {
  success: boolean;
  prescriptionId?: string;
  errors?: string[];
}

export class SBISService {
  private baseUrl: string;
  private apiKey: string;
  private environment: 'sandbox' | 'production';

  constructor() {
    this.baseUrl = process.env.SBIS_API_URL || 'https://rnds.saude.gov.br/api';
    this.apiKey = process.env.SBIS_API_KEY || '';
    this.environment = (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production';
  }

  public async submitPrescription(prescription: SBISPrescription): Promise<RNDSResponse> {
    try {
      if (this.environment === 'sandbox') {
        return this.mockSubmitPrescription(prescription);
      }

      const fhirBundle = this.convertToFHIR(prescription);
      
      const response = await fetch(`${this.baseUrl}/fhir/Bundle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/fhir+json',
          'X-Authorization-Server': 'https://ehr-auth.rnds.saude.gov.br',
        },
        body: JSON.stringify(fhirBundle)
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          errors: [error.message || 'Failed to submit prescription to RNDS']
        };
      }

      const result = await response.json();
      
      return {
        success: true,
        prescriptionId: result.id
      };

    } catch (error) {
      console.error('SBIS submission error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private mockSubmitPrescription(prescription: SBISPrescription): RNDSResponse {
    console.log('Mock SBIS submission:', prescription);
    
    return {
      success: true,
      prescriptionId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private convertToFHIR(prescription: SBISPrescription): { resourceType: string; id: string; [key: string]: unknown } {
    return {
      resourceType: 'Bundle',
      id: prescription.id,
      type: 'document',
      timestamp: prescription.timestamp.toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Composition',
            id: `composition-${prescription.id}`,
            status: 'final',
            type: {
              coding: [{
                system: 'http://loinc.org',
                code: '57833-6',
                display: 'Prescription for medication'
              }]
            },
            subject: {
              reference: `Patient/patient-${prescription.patientCpf}`
            },
            author: [{
              reference: `Practitioner/practitioner-${prescription.doctorCrm}`
            }],
            title: 'Prescrição Médica Digital',
            section: [{
              title: 'Medicamentos Prescritos',
              code: {
                coding: [{
                  system: 'http://loinc.org',
                  code: '10160-0',
                  display: 'History of Medication use Narrative'
                }]
              },
              entry: prescription.medications.map(med => ({
                reference: `MedicationRequest/medication-${med.code}`
              }))
            }]
          }
        },
        {
          resource: {
            resourceType: 'Patient',
            id: `patient-${prescription.patientCpf}`,
            identifier: [{
              system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
              value: prescription.patientCpf
            }],
            name: [{
              text: prescription.patientName
            }]
          }
        },
        {
          resource: {
            resourceType: 'Practitioner',
            id: `practitioner-${prescription.doctorCrm}`,
            identifier: [{
              system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/crm',
              value: `${prescription.doctorCrm}/${prescription.doctorUf}`
            }]
          }
        },
        ...prescription.medications.map(med => ({
          resource: {
            resourceType: 'MedicationRequest',
            id: `medication-${med.code}`,
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
              coding: [{
                system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRMedicamento',
                code: med.code,
                display: med.name
              }]
            },
            subject: {
              reference: `Patient/patient-${prescription.patientCpf}`
            },
            requester: {
              reference: `Practitioner/practitioner-${prescription.doctorCrm}`
            },
            dosageInstruction: [{
              text: `${med.dosage} - ${med.instructions}`,
              timing: {
                repeat: {
                  frequency: 1,
                  period: 1,
                  periodUnit: 'd'
                }
              }
            }],
            dispenseRequest: {
              quantity: {
                value: med.quantity,
                unit: 'comprimido'
              }
            }
          }
        }))
      ]
    };
  }

  public async validateMedication(anvisaCode: string): Promise<boolean> {
    try {
      if (this.environment === 'sandbox') {
        return true;
      }

      const response = await fetch(`${this.baseUrl}/medication/validate/${anvisaCode}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Medication validation error:', error);
      return false;
    }
  }

  public async getPrescriptionStatus(prescriptionId: string): Promise<{ id: string; status: string; validUntil: Date }> {
    try {
      if (this.environment === 'sandbox') {
        return {
          id: prescriptionId,
          status: 'active',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
      }

      const response = await fetch(`${this.baseUrl}/prescription/${prescriptionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get prescription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get prescription status error:', error);
      throw error;
    }
  }

  public isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  public getEnvironment(): string {
    return this.environment;
  }
}

export const sbisService = new SBISService();
