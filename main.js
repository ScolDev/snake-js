const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
const delayTime = 100;
const squareSize = 40;

const Directions = {
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
};

const Palette = {
  bgColor: "#101014",
  snakeColor: "#006000",
  appleColor: "#600000",
};

const Screen = {
  height: canvas.offsetHeight,
  width: canvas.offsetWidth,
  horizontalSquares: Math.floor(canvas.offsetWidth / squareSize),
  verticalSquares: Math.floor(canvas.offsetHeight / squareSize),
};

const GameState = {
  score: 0,
  apple: [],
  snake: {
    body: [],
    lastSquare: [],
    direction: Directions.RIGHT,
  },
};

function listenInput() {
  document.addEventListener("keydown", processInputs);
}

function processInputs(event) {
  const newDir = event.code;
  const { UP, RIGHT, DOWN, LEFT } = Directions;
  const { snake } = GameState;

  if (
    (newDir === UP && snake.direction !== DOWN) ||
    (newDir === RIGHT && snake.direction !== LEFT) ||
    (newDir === DOWN && snake.direction !== UP) ||
    (newDir === LEFT && snake.direction !== RIGHT)) {
    snake.direction = newDir;
  }
}

function initializeGame() {
  canvas.height = Screen.height;
  canvas.width = Screen.width;

  const center = [
    Math.round(Screen.horizontalSquares / 2),
    Math.round(Screen.verticalSquares / 2),
  ];

  GameState.score = 0;
  GameState.snake.direction = Directions.RIGHT;
  GameState.snake.body = [
    [...center],
    [center[0] - 1, center[1]],
    [center[0] - 2, center[1]],
    [center[0] - 3, center[1]],
  ];
  GameState.apple = loadApple();
}

function loadApple() {
  const { snake } = GameState;
  let x, y, isAvailable;

  do {
    x = Math.floor(Math.random() * Screen.horizontalSquares);
    y = Math.floor(Math.random() * Screen.verticalSquares);

    isAvailable = snake.body.some(body => {
      return x !== body[0] || y !== body[1];
    });
  } while (!isAvailable);

  return [x, y];
}

function gameLoop() {
  updateState();
  validateCollisions();
  drawGame();

  delay();
}

function updateState() {
  const { snake } = GameState;
  let [x, y] = snake.body[0];

  if (snake.direction === Directions.UP) y--;
  else if (snake.direction === Directions.RIGHT) x++;
  else if (snake.direction === Directions.DOWN) y++;
  else if (snake.direction === Directions.LEFT) x--;

  snake.body.unshift([x, y]);
  snake.lastSquare = snake.body.pop();
}

function validateCollisions() {
  let { snake, apple } = GameState;
  const head = snake.body[0];

  if (head[0] >= Screen.horizontalSquares) head[0] = 0;
  if (head[0] < 0) head[0] = Screen.horizontalSquares - 1;
  if (head[1] >= Screen.verticalSquares) head[1] = 0;
  if (head[1] < 0) head[1] = Screen.verticalSquares - 1;

  if (head[0] === apple[0] && head[1] === apple[1]) {
    GameState.apple = loadApple();
    return snake.body.push(snake.lastSquare);
  }

  const hasCollision = snake.body.some((body, index) => {
    return index > 0 &&
      body[0] === head[0] &&
      body[1] === head[1]
  });

  if (hasCollision) return initializeGame();
}

function drawGame() {
  drawScenario();
  drawApple();
  drawSnake();
}

function drawScenario() {
  context.fillStyle = Palette.bgColor;
  context.clearRect(0, 0, Screen.width, Screen.height);
  context.fillRect(0, 0, Screen.width, Screen.height);
}

function drawSnake() {
  for (let tile of GameState.snake.body) {
    drawSquare(tile, Palette.snakeColor);
  }
}

function drawSquare(square, color) {
  const x = squareSize * square[0];
  const y = squareSize * square[1];

  context.fillStyle = color;
  context.fillRect(x, y, squareSize, squareSize);
}

function drawApple() {
  drawSquare(GameState.apple, Palette.appleColor);
}

function delay() {
  setTimeout(() => {
    requestAnimationFrame(gameLoop);
  }, delayTime);
}

function start() {
  listenInput();
  initializeGame();
  gameLoop();
}

start();
