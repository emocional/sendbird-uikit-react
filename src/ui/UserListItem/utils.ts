export const getGlobalUserTag = (metadata: string) => {
  return metadata === 'coach' ? 'Coach Emocional' : metadata === 'psychologist' ? 'Psicólogo/a' : metadata;
};
