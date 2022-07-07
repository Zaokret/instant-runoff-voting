/*
Instant-runoff voting
https://en.wikipedia.org/wiki/Instant-runoff_voting

(x) number of candidates to vote for
(y) number of voters who vote for the top (z) candidates

sort the candidates by the most votes (for rank 1) in a leaderboard
candidate wins if gets the majority of the votes, if not we continue until the candidate with the majority is found
remove candidate with the least number of votes from the leaderboard
voters for which their first ranked candidate got removed get their next ranked vote counted towards a candidate on the leaderboard
if there is a tie between candidates, count next ranked vote of their voters
*/

//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomRankings(options = [], num = 0) {
  const ranking = [];

  while (ranking.length < num) {
    const randomInt = getRandomInt(1, options.length + 1);
    if (!ranking.includes(randomInt)) {
      ranking.push(randomInt);
    }
  }
  return ranking;
}

function createLeaderboard(_candidates, _voters) {
  return _candidates
    .map((c) => ({
      id: c.id,
      voters: _voters
        .filter((voter) => voter.votes[0] === c.id)
        .map((voter) => voter.id),
    }))
    .filter((candidate) => candidate.voters.length > 0);
}

function findWinner(lb) {
  if (lb.length === 1) {
    return lb[0];
  }
  return lb.find((candidate) => candidate.voters.length >= majority);
}

function nextRoundWithoutRemoving(_leaderboard, _voters) {
  const votersAdjustedNextChoice = _voters.map((voter) => {
    // if voter didn't vote for any of the candidates
    if (_leaderboard.every((candidate) => candidate.id !== voter.votes[0])) {
      return {
        ...voter,
        votes: voter.votes.filter((_, index) => index !== 0),
      };
    }
    return voter;
  });

  // if it can't be adjusted
  if (
    votersAdjustedNextChoice
      .filter((v) => v.votes.length > 0)
      .every((voter) => _leaderboard.some((c) => c.id === voter.votes[0]))
  ) {
    const duplicatedVoters = votersAdjustedNextChoice.concat(
      ...votersAdjustedNextChoice
        .filter((v) => v.votes.length > 0)
        .filter((voter) => _leaderboard.some((c) => c.id === voter.votes[0]))
        .map((voter) => ({
          ...voter,
          votes: voter.votes.filter((_, index) => index !== 0),
        }))
    );
    return [_leaderboard, duplicatedVoters];
  }

  return [_leaderboard, votersAdjustedNextChoice];
}

function nextRound(_leaderboard, _voters) {
  // check if candidates have the same number of votes
  const voteNumbers = _leaderboard.map((lb) => lb.voters.length);
  if (!voteNumbers.some((num) => voteNumbers.some((n) => num !== n))) {
    return nextRoundWithoutRemoving(_leaderboard, _voters);
  }

  const sortedCandidates = _leaderboard.sort(
    (a, b) => b.voters.length - a.voters.length
  );

  const leastNumberOfVotes =
    sortedCandidates[sortedCandidates.length - 1].voters.length;

  const candidatesToBeRemoved = sortedCandidates.filter(
    (candidate) => candidate.voters.length === leastNumberOfVotes
  );

  const secondRoundCandidates = sortedCandidates.filter(
    (candidate) => candidate.voters.length !== leastNumberOfVotes
  );

  const votersAdjustedForSecondChoice = _voters.map((voter) => {
    const votedForCandidate = candidatesToBeRemoved.find((candidate) =>
      candidate.voters.includes(voter.id)
    );
    if (votedForCandidate) {
      const indexOfAValidVote = voter.votes.findIndex((v) =>
        secondRoundCandidates.some((c) => c.id === v)
      );

      return {
        ...voter,
        votes: voter.votes.filter((_, index) => index >= indexOfAValidVote),
      };
    }
    return voter;
  });

  return [secondRoundCandidates, votersAdjustedForSecondChoice];
}

const numberOfCandidates = 8;
const numberOfVoters = 15;
const numberOfRanks = 3;
const majority =
  numberOfVoters % 2 !== 0
    ? Math.ceil(numberOfVoters / 2)
    : numberOfVoters / 2 + 1;

const candidates = Array.from(Array(numberOfCandidates).keys()).map((id) => ({
  id: ++id,
  votes: [],
}));

var voters = Array.from(Array(numberOfVoters).keys()).map((id) => ({
  id,
  votes: getRandomRankings(candidates, numberOfRanks),
}));

var leaderboard = createLeaderboard(candidates, voters);

var winner = findWinner(leaderboard);

while (!winner) {
  if (leaderboard.length === 0) {
    break;
  }
  const [nextRoundLeaderboard, nextRoundVoters] = nextRound(
    leaderboard,
    voters
  );

  voters = nextRoundVoters;
  leaderboard = createLeaderboard(nextRoundLeaderboard, voters);
  winner = findWinner(leaderboard);
}

console.log(winner);
