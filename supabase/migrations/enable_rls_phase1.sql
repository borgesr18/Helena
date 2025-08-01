ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_prescricao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own profile" ON public.perfis_usuarios
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own patients" ON public.pacientes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own templates" ON public.modelos_prescricao
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own settings" ON public.configuracoes_usuario
  FOR ALL USING (auth.uid() = user_id);
