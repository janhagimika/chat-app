document.addEventListener("DOMContentLoaded", () => {
    const registerSection = document.getElementById("register-section");
    const loginSection = document.getElementById("login-section");
  
    // Toggle between login and registration forms
    document.getElementById("go-to-login").addEventListener("click", (e) => {
      e.preventDefault();
      registerSection.style.display = "none";
      loginSection.style.display = "block";
    });
  
    document.getElementById("go-to-register").addEventListener("click", (e) => {
      e.preventDefault();
      loginSection.style.display = "none";
      registerSection.style.display = "block";
    });
  
    // Handle registration
    document.getElementById("register-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;
  
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert("Registration successful!");
          registerSection.style.display = "none";
          loginSection.style.display = "block";
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Error during registration:", error);
      }
    });
  
    // Handle login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
  
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const result  = await response.json();
        if (response.ok) {
            // Save the token to localStorage
            localStorage.setItem("token", result.token);

            // Redirect to the dashboard page
            window.location.href = "/dashboard.html";
        } else {
            alert(result.message || "Login failed");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
      }
    });
  });
  