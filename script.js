let passwordVisible = false;

      const commonPasswords = [
        "password",
        "123456",
        "123456789",
        "qwerty",
        "abc123",
        "password123",
        "admin",
        "letmein",
        "welcome",
        "monkey",
        "1234567890",
        "dragon",
        "sunshine",
        "princess",
        "football",
        "iloveyou",
        "shadow",
        "master",
      ];

      const commonPatterns = [
        /^(.)\1{2,}$/, // Repeated characters
        /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/, // Sequential numbers
        /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
        /^(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i, // Keyboard patterns
      ];

      function togglePasswordVisibility() {
        const input = document.getElementById("passwordInput");
        const toggleBtn = document.querySelector(".toggle-password");

        passwordVisible = !passwordVisible;
        input.type = passwordVisible ? "text" : "password";
        toggleBtn.textContent = passwordVisible ? "🙈" : "👁️";
      }

      function analyzePassword(password) {
        if (!password) return null;

        const criteria = {
          length: password.length >= 8,
          uppercase: /[A-Z]/.test(password),
          lowercase: /[a-z]/.test(password),
          numbers: /[0-9]/.test(password),
          special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
          noCommon: !commonPasswords.includes(password.toLowerCase()),
          noPatterns: !commonPatterns.some((pattern) => pattern.test(password)),
        };

        const score = Object.values(criteria).filter(Boolean).length;

        let strength, color, percentage;
        if (score <= 2) {
          strength = "Very Weak";
          color = "#f56565";
          percentage = 20;
        } else if (score <= 3) {
          strength = "Weak";
          color = "#ed8936";
          percentage = 40;
        } else if (score <= 4) {
          strength = "Fair";
          color = "#ecc94b";
          percentage = 60;
        } else if (score <= 5) {
          strength = "Good";
          color = "#48bb78";
          percentage = 80;
        } else {
          strength = "Strong";
          color = "#38a169";
          percentage = 100;
        }

        // Calculate entropy
        const charset = getCharsetSize(password);
        const entropy = Math.log2(Math.pow(charset, password.length));

        // Estimate time to crack (simplified)
        const combinations = Math.pow(charset, password.length);
        const timeSeconds = combinations / (1000000000 * 2); // Assuming 1 billion guesses per second
        const timeString = formatTime(timeSeconds);

        return {
          criteria,
          strength,
          color,
          percentage,
          entropy: Math.round(entropy),
          timeString,
          uniqueChars: new Set(password).size,
        };
      }

      function getCharsetSize(password) {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password))
          size += 32;
        return size || 1;
      }

      function formatTime(seconds) {
        if (seconds < 1) return "< 1 second";
        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        if (seconds < 31536000000)
          return `${Math.round(seconds / 31536000)} years`;
        return "> 1000 years";
      }

      function updateUI(analysis, password) {
        const strengthMeter = document.getElementById("strengthMeter");
        const strengthLabel = document.getElementById("strengthLabel");
        const criteriaList = document.getElementById("criteriaList");
        const suggestionsList = document.getElementById("suggestionsList");
        const passwordStats = document.getElementById("passwordStats");

        if (!analysis) {
          strengthMeter.style.width = "0%";
          strengthLabel.textContent = "Enter a password to analyze";
          strengthLabel.className = "strength-label";
          passwordStats.style.display = "none";
          return;
        }

        // Update strength meter
        strengthMeter.style.width = analysis.percentage + "%";
        strengthMeter.style.backgroundColor = analysis.color;
        strengthLabel.textContent = analysis.strength;
        strengthLabel.className = `strength-label strength-${analysis.strength
          .toLowerCase()
          .replace(" ", "-")}`;

        // Update criteria
        const criteriaItems = criteriaList.children;
        const criteriaKeys = [
          "length",
          "uppercase",
          "lowercase",
          "numbers",
          "special",
          "noCommon",
        ];

        criteriaKeys.forEach((key, index) => {
          const item = criteriaItems[index];
          const icon = item.querySelector(".criteria-icon");
          const met = analysis.criteria[key];

          icon.className = `criteria-icon ${
            met ? "criteria-met" : "criteria-not-met"
          }`;
          icon.textContent = met ? "✓" : "✗";
        });

        // Update suggestions
        const suggestions = generateSuggestions(analysis.criteria, password);
        suggestionsList.innerHTML = suggestions
          .map((s) => `<li class="suggestion-item">${s}</li>`)
          .join("");

        // Update stats
        document.getElementById("lengthStat").textContent = password.length;
        document.getElementById("entropyStat").textContent = analysis.entropy;
        document.getElementById("timeStat").textContent = analysis.timeString;
        document.getElementById("uniqueStat").textContent =
          analysis.uniqueChars;
        passwordStats.style.display = "grid";
      }

      function generateSuggestions(criteria, password) {
        const suggestions = [];

        if (!criteria.length) {
          suggestions.push(
            "Use at least 8 characters - longer passwords are exponentially harder to crack"
          );
        }
        if (!criteria.uppercase) {
          suggestions.push(
            "Add uppercase letters (A-Z) to increase complexity"
          );
        }
        if (!criteria.lowercase) {
          suggestions.push(
            "Include lowercase letters (a-z) for better security"
          );
        }
        if (!criteria.numbers) {
          suggestions.push("Include numbers (0-9) to strengthen your password");
        }
        if (!criteria.special) {
          suggestions.push(
            "Add special characters (!@#$%^&*) for maximum security"
          );
        }
        if (!criteria.noCommon) {
          suggestions.push(
            "Avoid common passwords - use something unique and personal"
          );
        }
        if (!criteria.noPatterns) {
          suggestions.push('Avoid predictable patterns like "123" or "abc"');
        }

        if (password.length < 12) {
          suggestions.push(
            "Consider using 12+ characters for optimal security"
          );
        }

        if (suggestions.length === 0) {
          suggestions.push(
            "Excellent! Your password meets all security criteria"
          );
          suggestions.push("Consider using a unique password for each account");
          suggestions.push("Store passwords securely in a password manager");
        }

        return suggestions;
      }

      function updateLength() {
        const slider = document.getElementById("lengthSlider");
        document.getElementById("lengthValue").textContent = slider.value;
      }

      function generatePassword() {
        const length = parseInt(document.getElementById("lengthSlider").value);
        const includeUpper = document.getElementById("includeUpper").checked;
        const includeLower = document.getElementById("includeLower").checked;
        const includeNumbers =
          document.getElementById("includeNumbers").checked;
        const includeSpecial =
          document.getElementById("includeSpecial").checked;

        let charset = "";
        if (includeUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeLower) charset += "abcdefghijklmnopqrstuvwxyz";
        if (includeNumbers) charset += "0123456789";
        if (includeSpecial) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

        if (!charset) {
          alert("Please select at least one character type");
          return;
        }

        let password = "";
        for (let i = 0; i < length; i++) {
          password += charset.charAt(
            Math.floor(Math.random() * charset.length)
          );
        }

        document.getElementById("generatedText").textContent = password;
        document.getElementById("generatedPassword").style.display = "block";

        // Auto-analyze the generated password
        document.getElementById("passwordInput").value = password;
        const analysis = analyzePassword(password);
        updateUI(analysis, password);
      }

      function copyPassword() {
        const password = document.getElementById("generatedText").textContent;
        navigator.clipboard.writeText(password).then(() => {
          const btn = document.querySelector(".copy-btn");
          const originalText = btn.textContent;
          btn.textContent = "Copied!";
          btn.style.background = "#38a169";
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "#667eea";
          }, 2000);
        });
      }

      // Real-time password analysis
      document
        .getElementById("passwordInput")
        .addEventListener("input", (e) => {
          const password = e.target.value;
          const analysis = analyzePassword(password);
          updateUI(analysis, password);
        });

      // Initialize
      updateUI(null, "");