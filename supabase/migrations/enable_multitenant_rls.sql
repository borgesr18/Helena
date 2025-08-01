ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interacoes_medicamentos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_clinic_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT clinica_id FROM public.usuarios_clinica 
  WHERE user_id = $1 AND ativo = true 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION has_clinic_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_clinica 
    WHERE user_id = $1 AND role = $2 AND ativo = true
  );
$$;

CREATE POLICY "Users can view their clinic" ON public.clinicas
  FOR SELECT USING (id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage clinics" ON public.clinicas
  FOR ALL USING (has_clinic_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view clinic members" ON public.usuarios_clinica
  FOR SELECT USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage clinic users" ON public.usuarios_clinica
  FOR ALL USING (
    clinica_id = get_user_clinic_id(auth.uid()) AND 
    has_clinic_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can only see clinic patients" ON public.pacientes
  FOR ALL USING (
    user_id = auth.uid() OR 
    clinica_id = get_user_clinic_id(auth.uid())
  );

CREATE POLICY "Users can only see clinic prescriptions" ON public.prescricoes
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.pacientes p 
      WHERE p.nome = prescricoes.paciente 
      AND p.clinica_id = get_user_clinic_id(auth.uid())
    )
  );
