const giveawayRoll = (participants: string[], winners: number): string => {

  const validParticipants = participants.filter((p): p is string => !!p);

  const shuffledParticipants = [...validParticipants];
  let currentIndex = shuffledParticipants.length;
  let randomIndex;

  if (winners > validParticipants.length) {
    winners = validParticipants.length;
  }

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
  
    const aux = shuffledParticipants[randomIndex];
    const aux2 = shuffledParticipants[currentIndex];
    if (!aux || !aux2) throw new Error();
    shuffledParticipants[currentIndex] = aux;
    shuffledParticipants[randomIndex] = aux2;

  }

  if (winners == 1) {
    return `<@${shuffledParticipants[0]}>`;
  } 
  let participantsString: string = `<@${shuffledParticipants[0]}>`
  for (let i = 1; i < winners - 1; i++) {
    participantsString += `, <@${shuffledParticipants[i]}>`;
  }
  participantsString += ` e <@${shuffledParticipants[winners - 1]}>`;
  return participantsString;   
}

export default giveawayRoll;