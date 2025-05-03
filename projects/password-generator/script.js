/**
 * Password Generator
 * A professional tool for generating secure passwords
 */

// Configuration options for password generation
const CONFIG = {
  MIN_LENGTH: 12,
  SYMBOLS: "!@#$%^&*()_+[]{}|:;,.<>?",
  NUMBERS: "0123456789",
  LOWERCASE: "abcdefghijklmnopqrstuvwxyz",
  UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  AMBIGUOUS: /[Il1O0]/g,
  REPLACEMENT_CHAR: "#"
};

/**
 * Calculates password strength and updates the strength meter
 */
function updateStrengthMeter() {
  const password = document.getElementById("basePassword").value;
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  
  // Calculate password strength score (0-100)
  const score = calculatePasswordStrength(password);
  
  // Map score to display values
  const strengths = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["#ff4d4d", "#ffa64d", "#ffff4d", "#4da6ff", "#4dff88"];
  
  // Determine strength level (0-4)
  const strengthLevel = Math.min(4, Math.floor(score / 20));
  
  // Update UI
  strengthBar.style.width = `${score}%`;
  strengthBar.style.background = colors[strengthLevel];
  strengthText.textContent = `Strength: ${strengths[strengthLevel]}`;
  
  // Show strength details if password exists
  document.getElementById("strengthDetails").style.display = password ? "block" : "none";
}

/**
 * Calculates a password strength score (0-100)
 * @param {string} password - The password to evaluate
 * @return {number} Strength score
 */
function calculatePasswordStrength(password) {
  if (!password) return 0;
  
  let score = 0;
  
  // Length contribution (up to 40 points)
  score += Math.min(40, password.length * 4);
  
  // Character variety contribution (up to 60 points)
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
  score += (hasLower ? 10 : 0);
  score += (hasUpper ? 15 : 0);
  score += (hasDigit ? 15 : 0);
  score += (hasSymbol ? 20 : 0);
  
  // Penalize repetitive patterns
  if (/(.)\1\1/.test(password)) score -= 10;
  
  // Ensure minimum of 5 for any non-empty password
  return Math.max(5, Math.min(100, score));
}

/**
 * Updates strength details in the UI
 * @param {string} password - The password to analyze
 */
function updateStrengthDetails(password) {
  const details = document.getElementById("strengthDetailsList");
  details.innerHTML = "";
  
  if (!password) return;
  
  // Check various strength criteria
  const checks = [
    { 
      passed: password.length >= CONFIG.MIN_LENGTH, 
      message: `Length: ${password.length}/${CONFIG.MIN_LENGTH}+ characters`,
      icon: password.length >= CONFIG.MIN_LENGTH ? "✓" : "✗"
    },
    { 
      passed: /[A-Z]/.test(password), 
      message: "Contains uppercase letters",
      icon: /[A-Z]/.test(password) ? "✓" : "✗"
    },
    { 
      passed: /[a-z]/.test(password), 
      message: "Contains lowercase letters",
      icon: /[a-z]/.test(password) ? "✓" : "✗"
    },
    { 
      passed: /[0-9]/.test(password), 
      message: "Contains numbers",
      icon: /[0-9]/.test(password) ? "✓" : "✗"
    },
    { 
      passed: /[^A-Za-z0-9]/.test(password), 
      message: "Contains special characters",
      icon: /[^A-Za-z0-9]/.test(password) ? "✓" : "✗"
    },
    { 
      passed: !/(.)\1\1/.test(password), 
      message: "No character repeats 3+ times",
      icon: !/(.)\1\1/.test(password) ? "✓" : "✗"
    }
  ];
  
  // Add each check to the details list
  checks.forEach(check => {
    const item = document.createElement("li");
    item.className = check.passed ? "passed" : "failed";
    item.innerHTML = `<span class="check-icon">${check.icon}</span> ${check.message}`;
    details.appendChild(item);
  });
}

/**
 * Generates random passwords based on user input
 */
function generatePasswords() {
  // Get input values
  const input = document.getElementById("basePassword").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const length = parseInt(document.getElementById("length").value) || CONFIG.MIN_LENGTH;
  const options = getPasswordOptions();
  
  // Prepare output container
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";
  
  // Create heading for results
  const heading = document.createElement("h3");
  heading.textContent = "Generated Passwords";
  outputDiv.appendChild(heading);
  
  // Create password container
  const passwordsContainer = document.createElement("div");
  passwordsContainer.className = "passwords-container";
  outputDiv.appendChild(passwordsContainer);
  
  // Store generated passwords
  const passwords = [];
  
  // Generate each password
  for (let i = 0; i < quantity; i++) {
    // Create password using provided options
    const password = createPassword(input, length, options);
    passwords.push(password);
    
    // Create password display element
    const passwordElement = createPasswordElement(password, i + 1);
    passwordsContainer.appendChild(passwordElement);
  }
  
  // Store passwords for later use
  window.generatedPasswords = passwords;
  
  // Show the bulk actions section
  document.getElementById("bulkActions").style.display = "block";
  
  // Display success message
  showNotification(`Successfully generated ${quantity} password${quantity > 1 ? 's' : ''}`);
}

/**
 * Creates a password element in the UI
 * @param {string} password - The password to display
 * @param {number} index - The index number 
 * @return {HTMLElement} The password display element
 */
function createPasswordElement(password, index) {
  // Create container
  const container = document.createElement("div");
  container.className = "password-item";
  
  // Create numbering
  const indexSpan = document.createElement("span");
  indexSpan.className = "password-index";
  indexSpan.textContent = index + ".";
  container.appendChild(indexSpan);
  
  // Create password text
  const passwordSpan = document.createElement("span");
  passwordSpan.className = "password-text";
  passwordSpan.textContent = password;
  container.appendChild(passwordSpan);
  
  // Create copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.title = "Copy to clipboard";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(password);
    showNotification("Password copied to clipboard!");
  };
  container.appendChild(copyBtn);
  
  return container;
}

/**
 * Gets the selected password generation options
 * @return {Object} Selected options
 */
function getPasswordOptions() {
  return {
    useSymbols: document.getElementById("useSymbols").checked,
    useNumbers: document.getElementById("useNumbers").checked,
    useUppercase: document.getElementById("useUppercase").checked,
    useLowercase: document.getElementById("useLowercase").checked,
    avoidAmbiguous: document.getElementById("avoidAmbiguous").checked,
    enhanceBase: document.getElementById("enhanceBase").checked
  };
}

/**
 * Creates a password based on input and options
 * @param {string} baseInput - The base password (optional)
 * @param {number} targetLength - The desired password length
 * @param {Object} options - Password generation options
 * @return {string} The generated password
 */
function createPassword(baseInput, targetLength, options) {
  let password = "";
  
  // Start with the base input if provided
  if (baseInput) {
    // Apply enhanced base password with randomness
    password = options.enhanceBase ? enhanceBasePassword(baseInput, targetLength) : baseInput;
  }
  
  // Generate a completely random password if no base or too short
  if (!password || password.length < targetLength) {
    password = generateRandomPassword(targetLength, options);
  }
  
  // Ensure length is correct (truncate if too long)
  if (password.length > targetLength) {
    password = password.substring(0, targetLength);
  }
  
  // Replace ambiguous characters if needed
  if (options.avoidAmbiguous) {
    password = password.replace(CONFIG.AMBIGUOUS, CONFIG.REPLACEMENT_CHAR);
  }
  
  return password;
}

/**
 * Enhances a base password with substitutions and adds random elements
 * @param {string} base - The base password
 * @param {number} targetLength - The desired password length
 * @return {string} The enhanced password with added randomness
 */
function enhanceBasePassword(base, targetLength) {
  // Common letter-to-symbol substitutions
  let enhanced = base
    .replace(/a/gi, "@")
    .replace(/s/gi, "$")
    .replace(/i/gi, "!")
    .replace(/o/gi, "0")
    .replace(/e/gi, "3")
    .replace(/t/gi, "7");
  
  // Add randomness by mixing the character order
  enhanced = shuffleString(enhanced);
  
  // Add random symbols and numbers to make it more unique
  const remainingLength = targetLength - enhanced.length;
  if (remainingLength > 0) {
    const randomChars = getRandomChars(remainingLength);
    enhanced += randomChars;
  }
  
  return enhanced;
}

/**
 * Randomly shuffles a string
 * @param {string} str - The string to shuffle
 * @return {string} The shuffled string
 */
function shuffleString(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Gets random characters for password enhancement
 * @param {number} length - Number of random characters needed
 * @return {string} Random characters
 */
function getRandomChars(length) {
  let result = '';
  const charTypes = [
    CONFIG.LOWERCASE, 
    CONFIG.UPPERCASE, 
    CONFIG.NUMBERS, 
    CONFIG.SYMBOLS
  ];

  for (let i = 0; i < length; i++) {
    // Select a random character type
    const typeIndex = Math.floor(Math.random() * charTypes.length);
    const charSet = charTypes[typeIndex];
    
    // Select a random character from the chosen type
    const charIndex = Math.floor(Math.random() * charSet.length);
    result += charSet[charIndex];
  }

  return result;
}

/**
 * Generates a completely random password
 * @param {number} length - The password length
 * @param {Object} options - Password generation options
 * @return {string} The generated password
 */
function generateRandomPassword(length, options) {
  let charPool = "";
  
  // Build character pool based on selected options
  if (options.useLowercase) charPool += CONFIG.LOWERCASE;
  if (options.useUppercase) charPool += CONFIG.UPPERCASE;
  if (options.useNumbers) charPool += CONFIG.NUMBERS;
  if (options.useSymbols) charPool += CONFIG.SYMBOLS;
  
  // Default to lowercase if nothing selected
  if (!charPool) charPool = CONFIG.LOWERCASE;
  
  // Generate the password
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    password += charPool[randomIndex];
  }
  
  return password;
}

/**
 * Shows a notification message to the user
 * @param {string} message - The message to display
 */
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");
  
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

/**
 * Downloads generated passwords as a PDF file
 */
function downloadPDF() {
  const passwords = window.generatedPasswords || [];
  if (passwords.length === 0) {
    return showNotification("Please generate passwords first");
  }

  try {
    // Create PDF content
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Secure Password Report", 20, 20);
    
    // Add date and info
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Number of passwords: ${passwords.length}`, 20, 38);
    
    // Add passwords
    doc.setFontSize(12);
    passwords.forEach((password, i) => {
      doc.text(`${i + 1}. ${password}`, 20, 50 + (i * 8));
    });
    
    // Add footer with disclaimer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.text("Store these passwords securely and do not share this document.", 20, doc.internal.pageSize.height - 20);
    doc.text("Developed by Upendra Khanal | upendrakhanal2006@gmail.com", 20, doc.internal.pageSize.height - 10);
    
    // Save PDF
    doc.save("SecurePasswords.pdf");
    showNotification("Passwords downloaded as PDF");
  } catch (error) {
    console.error("PDF generation error:", error);
    showNotification("Error creating PDF. Try again.");
  }
}

/**
 * Exports passwords as a text file
 */
function exportTXT() {
  const passwords = window.generatedPasswords || [];
  if (passwords.length === 0) {
    return showNotification("Please generate passwords first");
  }

  // Create text content
  let content = "SECURE PASSWORDS\n";
  content += "=================\n\n";
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  passwords.forEach((password, i) => {
    content += `${i + 1}. ${password}\n`;
  });
  
  content += "\n=================\n";
  content += "Developed by Upendra Khanal | upendrakhanal2006@gmail.com";
  
  // Create and download the file
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "SecurePasswords.txt";
  link.click();
  URL.revokeObjectURL(url);
  
  showNotification("Passwords exported as TXT file");
}

/**
 * Copies all generated passwords to clipboard
 */
function copyAllPasswords() {
  const passwords = window.generatedPasswords || [];
  if (passwords.length === 0) {
    return showNotification("Please generate passwords first");
  }
  
  const content = passwords.join("\n");
  navigator.clipboard.writeText(content);
  
  showNotification("All passwords copied to clipboard");
}

/**
 * Toggles between light and dark mode
 */
function toggleDarkMode() {
  document.body.classList.toggle("light-mode");
  
  // Save preference to localStorage
  const isDarkMode = !document.body.classList.contains("light-mode");
  localStorage.setItem("darkMode", isDarkMode.toString());
  
  // Update icon
  updateThemeIcon(isDarkMode);
}

/**
 * Updates the theme toggle icon based on current mode
 * @param {boolean} isDarkMode - Whether dark mode is active
 */
function updateThemeIcon(isDarkMode) {
  const themeIcon = document.getElementById("themeIcon");
  themeIcon.className = isDarkMode ? "fas fa-moon" : "fas fa-sun";
}

/**
 * Initializes the application
 */
function initialize() {
  // Load saved theme preference
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode !== null) {
    const isDarkMode = savedDarkMode === "true";
    document.body.classList.toggle("light-mode", !isDarkMode);
    updateThemeIcon(isDarkMode);
  } else {
    // Default to dark mode
    updateThemeIcon(true);
  }
  
  // Set default values
  document.getElementById("length").value = CONFIG.MIN_LENGTH;
  
  // Add event listeners for password strength updates
  document.getElementById("basePassword").addEventListener("input", function() {
    updateStrengthMeter();
    updateStrengthDetails(this.value);
  });
  
  // Initialize strength meter empty state
  updateStrengthMeter();
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);