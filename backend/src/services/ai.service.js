const generateText = async (prompt) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
};

exports.generateResume = async (profile, experiences, formations, skills, languages) => {
  const prompt = `Tu es un expert en rédaction de CV professionnels.

Génère un résumé professionnel percutant (3-4 phrases max) pour cette personne:

Titre: ${profile.titreProfessionnel || 'Non spécifié'}
Expériences: ${experiences.map(e => `${e.poste} chez ${e.entreprise}`).join(', ')}
Formations: ${formations.map(f => `${f.diplome} - ${f.etablissement}`).join(', ')}
Compétences: ${skills.map(s => s.nom).join(', ')}
Langues: ${languages.map(l => `${l.nom} (${l.niveau})`).join(', ')}

Réponds uniquement avec le résumé, sans introduction ni explication.`;

  return await generateText(prompt);
};

exports.generateCoverLetter = async (profile, experiences, formations, skills, jobOffer) => {
  const prompt = `Tu es un expert en rédaction de lettres de motivation professionnelles.

Génère une lettre de motivation complète et professionnelle pour:

CANDIDAT:
- Nom: ${profile.user?.nom || ''} ${profile.user?.prenom || ''}
- Titre: ${profile.titreProfessionnel || ''}
- Résumé: ${profile.resume || ''}
- Expériences: ${experiences.map(e => `${e.poste} chez ${e.entreprise}: ${e.description || ''}`).join(' | ')}
- Formations: ${formations.map(f => `${f.diplome} - ${f.etablissement}`).join(', ')}
- Compétences: ${skills.map(s => `${s.nom} (${s.niveau})`).join(', ')}

OFFRE D'EMPLOI:
- Poste: ${jobOffer.titrePoste}
- Entreprise: ${jobOffer.entreprise}
- Description: ${jobOffer.description}

Génère une lettre structurée avec: introduction, développement, conclusion avec formule de politesse.
Réponds uniquement avec la lettre, sans commentaires.`;

  return await generateText(prompt);
};

exports.generateEmail = async (profile, jobOffer) => {
  const prompt = `Tu es un expert en communication professionnelle.

Génère un email de candidature court et professionnel pour:

CANDIDAT:
- Nom: ${profile.user?.nom || ''} ${profile.user?.prenom || ''}
- Titre: ${profile.titreProfessionnel || ''}

OFFRE:
- Poste: ${jobOffer.titrePoste}
- Entreprise: ${jobOffer.entreprise}

L'email doit être concis, professionnel, avec objet, corps et formule de politesse.
Réponds avec: OBJET: [objet] puis le corps de l'email.`;

  return await generateText(prompt);
};

exports.adaptToOffer = async (content, jobOffer) => {
  const prompt = `Tu es un expert en optimisation de candidatures.

Adapte et améliore ce contenu pour correspondre parfaitement à cette offre d'emploi:

OFFRE:
- Poste: ${jobOffer.titrePoste}
- Entreprise: ${jobOffer.entreprise}
- Description: ${jobOffer.description}

CONTENU À ADAPTER:
${content}

Améliore le contenu en mettant en valeur les éléments pertinents pour cette offre.
Réponds uniquement avec le contenu amélioré.`;

  return await generateText(prompt);
};

exports.improveText = async (text) => {
  const prompt = `Tu es un expert en rédaction professionnelle.

Améliore ce texte pour le rendre plus professionnel, percutant et convaincant:

${text}

Réponds uniquement avec le texte amélioré, sans commentaires.`;

  return await generateText(prompt);
};

exports.generateApplicationPitch = async (profile, experiences, formations, skills, languages, jobOffer) => {
  const prompt = `Tu es un coach expert des candidatures.

Redige un message de candidature convaincant, humain et professionnel pour postuler a cette offre.

CANDIDAT:
- Nom: ${profile.user?.prenom || ''} ${profile.user?.nom || ''}
- Titre: ${profile.titreProfessionnel || ''}
- Resume: ${profile.resume || ''}
- Experiences: ${experiences.map((e) => `${e.poste} chez ${e.entreprise}: ${e.description || ''}`).join(' | ')}
- Formations: ${formations.map((f) => `${f.diplome} - ${f.etablissement}`).join(' | ')}
- Competences: ${skills.map((s) => `${s.nom}${s.niveau ? ` (${s.niveau})` : ''}`).join(', ')}
- Langues: ${languages.map((l) => `${l.nom} (${l.niveau})`).join(', ')}

OFFRE:
- Poste: ${jobOffer.titrePoste}
- Entreprise: ${jobOffer.entreprise}
- Description: ${jobOffer.description}
- Responsabilites: ${(jobOffer.responsibilities || []).join(', ')}
- Requirements: ${(jobOffer.requirements || []).join(', ')}

Consignes:
- 140 a 220 mots
- Montre clairement l'alignement entre le profil et le besoin
- Termine par une phrase proactive et polie
- Reponds uniquement avec le message final.`;

  return await generateText(prompt);
};
