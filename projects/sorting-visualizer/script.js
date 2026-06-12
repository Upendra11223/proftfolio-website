/**
 * Sorting Visualizer
 * Five classic algorithms animated on a canvas, written as plain
 * async functions so the algorithm code reads like the textbook version.
 */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const algorithmSelect = document.getElementById("algorithm");
const sizeSlider = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");
const speedSlider = document.getElementById("speed");
const shuffleBtn = document.getElementById("shuffleBtn");
const sortBtn = document.getElementById("sortBtn");
const stopBtn = document.getElementById("stopBtn");
const comparisonsEl = document.getElementById("comparisons");
const writesEl = document.getElementById("writes");
const statusText = document.getElementById("statusText");

const COLORS = {
  bar: "#3d4654",
  compare: "#f0b429",   // currently being compared
  write: "#ef6351",     // being written/swapped
  sorted: "#4dbd74",    // confirmed in final position
  pivot: "#b58cf0"      // quick sort pivot
};

let values = [];        // the array being sorted
let marks = {};         // index -> color name, for highlighting
let sortedUpTo = new Set(); // indices known to be in final position
let comparisons = 0;
let writes = 0;
let sorting = false;
let stopRequested = false;

/* ---------- array setup ---------- */

function newArray() {
  const n = parseInt(sizeSlider.value, 10);
  values = Array.from({ length: n }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  marks = {};
  sortedUpTo = new Set();
  comparisons = 0;
  writes = 0;
  updateStats();
  statusText.textContent = "ready";
  draw();
}

/* ---------- drawing ---------- */

function draw() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const n = values.length;
  const barWidth = w / n;
  const maxVal = n;

  for (let i = 0; i < n; i++) {
    const barHeight = (values[i] / maxVal) * (h - 20);
    if (marks[i]) {
      ctx.fillStyle = COLORS[marks[i]];
    } else if (sortedUpTo.has(i)) {
      ctx.fillStyle = COLORS.sorted;
    } else {
      ctx.fillStyle = COLORS.bar;
    }
    ctx.fillRect(i * barWidth + 0.5, h - barHeight, Math.max(barWidth - 1, 1), barHeight);
  }
}

function updateStats() {
  comparisonsEl.textContent = comparisons.toLocaleString();
  writesEl.textContent = writes.toLocaleString();
}

/* ---------- animation helpers ---------- */

class StopSort extends Error {}

let opCount = 0;
function delay() {
  // speed 1 (slow) -> ~120ms, speed 100 (fast) -> 0ms
  const speed = parseInt(speedSlider.value, 10);
  const ms = Math.floor(Math.pow((100 - speed) / 100, 2) * 120);
  // At max speed, batch operations between timer yields — browsers clamp
  // setTimeout(0) to ~4ms, which would make "fast" feel slow on big arrays
  opCount++;
  if (ms === 0 && opCount % 10 !== 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tick(highlights) {
  if (stopRequested) throw new StopSort();
  marks = highlights || {};
  updateStats();
  draw();
  await delay();
}

async function compare(i, j) {
  comparisons++;
  await tick({ [i]: "compare", [j]: "compare" });
  return values[i] - values[j];
}

async function swap(i, j) {
  [values[i], values[j]] = [values[j], values[i]];
  writes += 2;
  await tick({ [i]: "write", [j]: "write" });
}

async function write(i, value) {
  values[i] = value;
  writes++;
  await tick({ [i]: "write" });
}

/* ---------- the algorithms ---------- */

async function bubbleSort() {
  const n = values.length;
  for (let end = n - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      if ((await compare(i, i + 1)) > 0) {
        await swap(i, i + 1);
        swapped = true;
      }
    }
    sortedUpTo.add(end);
    if (!swapped) break; // already sorted — bail early
  }
}

async function insertionSort() {
  const n = values.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && (await compare(j - 1, j)) > 0) {
      await swap(j - 1, j);
      j--;
    }
  }
}

async function selectionSort() {
  const n = values.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if ((await compare(j, min)) < 0) min = j;
    }
    if (min !== i) await swap(i, min);
    sortedUpTo.add(i);
  }
}

async function mergeSort(lo = 0, hi = values.length - 1) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  await mergeSort(lo, mid);
  await mergeSort(mid + 1, hi);

  // Merge values[lo..mid] and values[mid+1..hi]
  const merged = [];
  let i = lo, j = mid + 1;
  while (i <= mid && j <= hi) {
    if ((await compare(i, j)) <= 0) merged.push(values[i++]);
    else merged.push(values[j++]);
  }
  while (i <= mid) merged.push(values[i++]);
  while (j <= hi) merged.push(values[j++]);

  for (let k = 0; k < merged.length; k++) {
    await write(lo + k, merged[k]);
  }
}

async function quickSort(lo = 0, hi = values.length - 1) {
  if (lo >= hi) {
    if (lo === hi) sortedUpTo.add(lo);
    return;
  }

  // Lomuto partition with the last element as pivot
  const pivot = values[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    comparisons++;
    await tick({ [j]: "compare", [hi]: "pivot" });
    if (values[j] < pivot) {
      if (i !== j) await swap(i, j);
      i++;
    }
  }
  if (i !== hi) await swap(i, hi);
  sortedUpTo.add(i);

  await quickSort(lo, i - 1);
  await quickSort(i + 1, hi);
}

const ALGORITHMS = {
  bubble: bubbleSort,
  insertion: insertionSort,
  selection: selectionSort,
  merge: mergeSort,
  quick: quickSort
};

/* ---------- run control ---------- */

async function runSort() {
  if (sorting) return;
  sorting = true;
  stopRequested = false;
  comparisons = 0;
  writes = 0;
  sortedUpTo = new Set();

  sortBtn.disabled = true;
  shuffleBtn.disabled = true;
  sizeSlider.disabled = true;
  algorithmSelect.disabled = true;
  stopBtn.disabled = false;
  statusText.textContent = "sorting…";

  const t0 = performance.now();
  try {
    await ALGORITHMS[algorithmSelect.value]();
    // victory sweep
    marks = {};
    for (let i = 0; i < values.length; i++) sortedUpTo.add(i);
    draw();
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    statusText.textContent = `done in ${secs}s`;
  } catch (e) {
    if (e instanceof StopSort) {
      statusText.textContent = "stopped";
    } else {
      throw e;
    }
  } finally {
    marks = {};
    draw();
    updateStats();
    sorting = false;
    sortBtn.disabled = false;
    shuffleBtn.disabled = false;
    sizeSlider.disabled = false;
    algorithmSelect.disabled = false;
    stopBtn.disabled = true;
  }
}

/* ---------- events ---------- */

shuffleBtn.addEventListener("click", newArray);
sortBtn.addEventListener("click", runSort);
stopBtn.addEventListener("click", () => { stopRequested = true; });

sizeSlider.addEventListener("input", () => {
  sizeValue.textContent = sizeSlider.value;
  newArray();
});

newArray();
