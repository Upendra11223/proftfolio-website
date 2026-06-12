// Get DOM elements
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gameContainer = document.getElementById("gameContainer");
    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const finalScoreDisplay = document.getElementById("finalScore");
    const highScoreDisplay = document.getElementById("highScore");

    // Game variables - declare these first
    let gameState = "start"; // start, playing, gameover
    let bird = {};
    let pipes = [];
    let score = 0;
    let highScore = 0;
    try { highScore = parseInt(localStorage.getItem("flappyHighScore"), 10) || 0; } catch (e) {}
    let frame = 0;
    let dayNightCycle = 0;
    let groundX = 0;
    let lastPipeTime = 0;
    let animationFrameId = null;
    let isJumping = false;
    let lastTime = 0;
    let deltaTime = 0;

    // Game constants - will adjust based on screen size
    let BIRD_SIZE = 40;      // Default values, will be updated in setCanvasSize
    let PIPE_WIDTH = 70;
    let PIPE_GAP = 150;
    let PIPE_SPEED = 2;
    let GROUND_HEIGHT = 80;

    // Prevent scrolling on touch devices
    document.addEventListener('touchmove', function(e) {
      if (e.target === canvas) {
        e.preventDefault();
      }
    }, { passive: false });

    // Set canvas size and game constants based on device
    function setCanvasSize() {
      // Get the dimensions of the container
      const containerWidth = gameContainer.clientWidth;
      const containerHeight = gameContainer.clientHeight;

      // Set canvas dimensions to match container
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Adjust game constants based on screen size
      const scaleFactor = Math.min(containerWidth / 400, containerHeight / 600);
      
      BIRD_SIZE = Math.floor(40 * scaleFactor);
      PIPE_WIDTH = Math.floor(70 * scaleFactor);
      PIPE_GAP = Math.floor(150 * scaleFactor);
      PIPE_SPEED = Math.max(2 * scaleFactor, 1.5); // Ensure minimum speed
      GROUND_HEIGHT = Math.floor(80 * scaleFactor);

      // Keep the current run alive on resize — just clamp the bird back on screen
      if (gameState === "playing" && bird.y) {
        bird.y = Math.min(Math.max(bird.y, BIRD_SIZE), canvas.height - GROUND_HEIGHT - BIRD_SIZE);
      }
    }

    // Initialize game
    function initGame() {
      bird = {
        x: canvas.width * 0.2,
        y: canvas.height / 2,
        velocity: 0,
        gravity: 0.6 * (canvas.height / 600), // Scale gravity based on height
        jump: -8 * (canvas.height / 600),     // Scale jump based on height
        rotation: 0
      };
      
      pipes = [];
      particles = [];
      score = 0;
      frame = 0;
      dayNightCycle = 0;
      groundX = 0;
      lastPipeTime = 0;

      // Add initial pipe
      addPipe();
    }

    // Lightweight particle system: flap puffs, score sparkles, crash bursts
    let particles = [];

    function spawnParticles(x, y, color, count, speed) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const v = (Math.random() * 0.6 + 0.4) * speed;
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 1,
          size: Math.random() * 4 + 2,
          color: color
        });
      }
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime * 60;
        p.y += p.vy * deltaTime * 60;
        p.vy += 0.08 * deltaTime * 60;
        p.life -= 0.03 * deltaTime * 60;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    function drawParticles() {
      particles.forEach(function(p) {
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function addPipe() {
      const spacing = canvas.width * 0.75; // Adaptive spacing based on width
      const minHeight = canvas.height * 0.1; // 10% of screen height
      const maxHeight = canvas.height - PIPE_GAP - GROUND_HEIGHT - minHeight;
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      
      pipes.push({
        x: canvas.width,
        y: topHeight,
        passed: false
      });
      
      lastPipeTime = Date.now();
    }

    function drawBackground() {
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - GROUND_HEIGHT);
      const cycleValue = Math.sin(dayNightCycle / 200);
      
      if (cycleValue > 0) {
        // Day
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F7FA');
      } else {
        // Night
        skyGrad.addColorStop(0, '#0C1445');
        skyGrad.addColorStop(1, '#1B3A6B');
      }
      
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height - GROUND_HEIGHT);
    }

    function drawPipes() {
      pipes.forEach(function(pipe) {
        // Top pipe
        const pipeCap = 20 * (canvas.height / 600); // Scale cap size
        const pipeBodyGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        pipeBodyGrad.addColorStop(0, '#2ECC71');
        pipeBodyGrad.addColorStop(0.5, '#27AE60');
        pipeBodyGrad.addColorStop(1, '#2ECC71');
        
        // Top pipe body
        ctx.fillStyle = pipeBodyGrad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y - pipeCap);
        
        // Top pipe cap
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(pipe.x - 5, pipe.y - pipeCap, PIPE_WIDTH + 10, pipeCap);
        
        // Bottom pipe body
        ctx.fillStyle = pipeBodyGrad;
        ctx.fillRect(pipe.x, pipe.y + PIPE_GAP + pipeCap, PIPE_WIDTH, canvas.height - pipe.y - PIPE_GAP - GROUND_HEIGHT);
        
        // Bottom pipe cap
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(pipe.x - 5, pipe.y + PIPE_GAP, PIPE_WIDTH + 10, pipeCap);
      });
    }

    function drawGround() {
      // Ground
      const groundGrad = ctx.createLinearGradient(0, canvas.height - GROUND_HEIGHT, 0, canvas.height);
      groundGrad.addColorStop(0, '#8B4513');
      groundGrad.addColorStop(1, '#654321');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
      
      // Ground pattern
      ctx.strokeStyle = '#A0522D';
      ctx.lineWidth = 3;
      const patternSpace = canvas.width / 20; // Adaptive pattern spacing
      const offset = groundX % patternSpace;
      for (let i = -patternSpace; i < canvas.width + patternSpace; i += patternSpace) {
        const x = i - offset;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - GROUND_HEIGHT);
        ctx.lineTo(x - (patternSpace/2), canvas.height);
        ctx.stroke();
      }
    }

    function drawBird() {
      // Calculate rotation
      const targetRotation = Math.min(Math.max(bird.velocity * 0.04, -0.5), 0.5);
      bird.rotation += (targetRotation - bird.rotation) * 0.1;
      
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);
      
      const birdRadius = BIRD_SIZE/2;
      
      // Bird body
      ctx.fillStyle = '#F7DC6F';
      ctx.beginPath();
      ctx.arc(0, 0, birdRadius - 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Wing - animate based on flapping
      ctx.fillStyle = '#F4D03F';
      ctx.beginPath();
      
      // Wing flapping animation
      const wingPosition = (isJumping || bird.velocity < 0) ? 
                          Math.sin(Date.now() / 50) * 0.3 : 0.2;
      
      ctx.ellipse(birdRadius * 0.25, 0, 
                 birdRadius * 0.75, birdRadius * 0.4, 
                 Math.PI * wingPosition, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(birdRadius * -0.4, birdRadius * -0.25, birdRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(birdRadius * -0.5, birdRadius * -0.25, birdRadius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      // Beak
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath();
      ctx.moveTo(birdRadius * -0.75, 0);
      ctx.lineTo(birdRadius * -1.25, birdRadius * 0.25);
      ctx.lineTo(birdRadius * -1.25, birdRadius * -0.25);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }

    function drawScore() {
      const fontSize = Math.max(24, Math.floor(canvas.width / 10));
      
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.font = `bold ${fontSize}px "Press Start 2P", Arial`;
      ctx.textAlign = 'center';
      ctx.strokeText(score.toString(), canvas.width / 2, 50);
      ctx.fillText(score.toString(), canvas.width / 2, 50);
    }

    function updateGame(timestamp) {
      // Initialize time
      if (!lastTime) {
        lastTime = timestamp;
      }
      
      // Calculate delta time in seconds
      deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      
      // Cap delta time to prevent jumps after tab switch
      if (deltaTime > 0.1) deltaTime = 0.1;
      
      if (gameState !== "playing") return;
      
      frame++;
      dayNightCycle += 0.1;
      groundX = (groundX + PIPE_SPEED * deltaTime * 60) % 100000;
      
      // Update bird with delta time for consistent physics
      bird.velocity += bird.gravity * deltaTime * 60;
      bird.y += bird.velocity * deltaTime * 60;
      
      // Reset jump animation flag
      if (isJumping && bird.velocity > 0) {
        isJumping = false;
      }
      
      // Check ground/ceiling collision
      if (bird.y + BIRD_SIZE/2 > canvas.height - GROUND_HEIGHT || bird.y - BIRD_SIZE/2 < 0) {
        gameOver();
        return;
      }
      
      updateParticles();

      // Update pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED * deltaTime * 60;

        // Collision detection (hitbox slightly smaller than the sprite — feels fairer)
        const hit = BIRD_SIZE * 0.4;
        if (
          bird.x + hit > pipe.x &&
          bird.x - hit < pipe.x + PIPE_WIDTH &&
          (bird.y - hit < pipe.y || bird.y + hit > pipe.y + PIPE_GAP)
        ) {
          gameOver();
          return;
        }

        // Scoring
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
          score++;
          pipe.passed = true;

          // Play score sound
          playSound('score');
          spawnParticles(bird.x, bird.y, '#FFD700', 10, 2.5);

          // Update high score
          if (score > highScore) {
            highScore = score;
          }
        }
        
        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
          pipes.splice(i, 1);
        }
      }
      
      // Add new pipes based on time rather than position
      const now = Date.now();
      const pipeInterval = 2200; // changed for tighter pipe spacing // ms
      
      if (now - lastPipeTime > pipeInterval) {
        addPipe();
      }
    }

    function gameOver() {
      gameState = "gameover";

      // Play game over sound
      playSound('gameover');
      spawnParticles(bird.x, bird.y, '#E74C3C', 24, 4);

      try { localStorage.setItem("flappyHighScore", String(highScore)); } catch (e) {}

      finalScoreDisplay.textContent = score;
      highScoreDisplay.textContent = highScore;
      gameOverScreen.classList.add("visible");
    }

    function jump() {
      if (gameState === "playing") {
        bird.velocity = bird.jump;
        isJumping = true;

        // Play jump sound
        playSound('jump');
        spawnParticles(bird.x + BIRD_SIZE * 0.4, bird.y + BIRD_SIZE * 0.3, 'rgba(255,255,255,0.8)', 4, 1.5);
      }
    }

    // Sound effects — tiny synth beeps via WebAudio, no audio files needed
    let audioCtx = null;
    function playSound(type) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        if (type === 'jump') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now); osc.stop(now + 0.12);
        } else if (type === 'score') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1320, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'gameover') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now); osc.stop(now + 0.45);
        }
      } catch (e) { /* audio blocked — game still works silently */ }
    }

    function gameLoop(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updateGame(timestamp);

      // Draw all elements
      drawBackground();
      drawPipes();
      drawGround();
      drawParticles();
      drawBird();

      if (gameState === "playing") {
        drawScore();
      }

      if (gameState === "paused") {
        drawScore();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        const fs = Math.max(14, Math.floor(canvas.width / 18));
        ctx.font = `bold ${fs}px "Press Start 2P", Arial`;
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - fs);
        ctx.font = `${Math.floor(fs * 0.6)}px "Press Start 2P", Arial`;
        ctx.fillText('tap to resume', canvas.width / 2, canvas.height / 2 + fs);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Event listeners
    function handleInteraction(e) {
      e.preventDefault(); // Prevent default browser behavior

      if (gameState === "paused") {
        gameState = "playing"; // resume after tab switch
        return;
      }
      if (gameState === "playing") {
        jump();
      }
    }

    // Set up event listeners
    function setupEventListeners() {
      startBtn.addEventListener('click', function() {
        startScreen.classList.remove("visible");
        gameState = "playing";
        initGame();
        
        // For mobile devices - request full screen on game start
        if (window.innerWidth <= 768) {
          try {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
              document.documentElement.webkitRequestFullscreen();
            }
            document.body.classList.add('fullscreen');
          } catch(e) {
            console.log("Fullscreen not supported");
          }
        }
      });

      restartBtn.addEventListener('click', function() {
        gameOverScreen.classList.remove("visible");
        gameState = "playing";
        initGame();
      });

      // Keyboard input (good for laptops)
      window.addEventListener('keydown', function(e) {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
          if (gameState === "paused") {
            gameState = "playing"; // resume after tab switch
          } else if (gameState === "playing") {
            jump();
          }
          e.preventDefault(); // Prevent page scrolling
        }
      });

      // Mouse click input
      canvas.addEventListener('click', handleInteraction);
      
      // Touch input for mobile devices
      canvas.addEventListener('touchstart', handleInteraction, { passive: false });
      
      // Handle app going to background (mobile)
      document.addEventListener('visibilitychange', function() {
        if (document.hidden && gameState === "playing") {
          // Auto-pause when app goes to background
          gameState = "paused";
        }
      });
      
      // Handle mobile orientation changes
      window.addEventListener('orientationchange', function() {
        setTimeout(setCanvasSize, 300); // Delay to allow orientation to complete
      });
      
      // Handle game exit from fullscreen
      document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
          document.body.classList.remove('fullscreen');
        }
      });
    }

    // Initial setup - Call this first
    setCanvasSize();

    // Handle resize events
    window.addEventListener('resize', function() {
      setCanvasSize();
    });

    // Start game
    highScoreDisplay.textContent = highScore;
    initGame();
    setupEventListeners();
    animationFrameId = requestAnimationFrame(gameLoop);