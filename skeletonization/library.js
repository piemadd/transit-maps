

//B
const numberOfNonZeroNeighbors = (squaresObj) => {
  //all but P1
  const arr = Object.values(squaresObj).filter((x, i) => i != 0);
  return arr.filter((x) => x > 0).length;
};

//A
const numberOfZeroOnePatternsOnBorder = (squaresObj) => {
  //all but P1
  let arr = Object.values(squaresObj).filter((x, i) => i != 0);

  //adding P2 to the end of the array
  arr.push(arr[0]);
  return arr.filter((x, i, arr) => x === 0 && arr[i + 1] === 1).length;
};

const determineIfMeetsCriteria = (squares) => {
  const numeberOfNonZeroNeighborsResult = numberOfNonZeroNeighbors(squares);
  const numberOfZeroOnePatternsOnBorderResult = numberOfZeroOnePatternsOnBorder(squares);

  //first
  if (2 <= numeberOfNonZeroNeighborsResult && numeberOfNonZeroNeighborsResult <= 6) {
    return false;
  }

  //second
  if (numberOfZeroOnePatternsOnBorderResult == 1) {
    return false;
  }

  //third
  if (squares[2] * squares[4] * squares[8] == 0 || numberOfZeroOnePatternsOnBorderResult != 1) {
    return false;
  }

  //fourth
};