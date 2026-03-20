/**
 * Global Authentication & UI Management
 */

/**
 * Injects the custom styled modal HTML into the body of the current page.
 * This ensures the styled popup is available on every page, maintaining the site's design.
 */
function injectCustomModal() {
  if (document.getElementById("customModal")) return; // Prevent duplicate injection

  const modalHTML = `
    <div id="customModal" class="modal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.8); align-items:center; justify-content:center;">
      <div class="modal-content container" style="max-width:400px; padding:30px; text-align:center; border: 2px solid #8a2be2; box-shadow: 0 0 20px #8a2be2;">
        <h3 id="modalTitle" style="color: #fff; text-transform: uppercase; letter-spacing: 2px;">Notification</h3>
        <p id="modalMessage" style="color: #ccc; margin: 20px 0;"></p>
        
        <div id="modalPasswordSection" style="display: none; margin: 15px 0; text-align: left;">
          <label style="font-size: 0.9rem; color: #aaa; text-transform: uppercase;">Enter Password to Confirm:</label>
          <input type="password" id="modalPasswordInput" placeholder="Your password" 
                 style="width:100%; padding:12px; margin-top:8px; border-radius:4px; border:1px solid #444; background:#000; color:#fff; outline:none;">
        </div>

        <div class="modal-actions" style="display:flex; gap:15px; justify-content:center; margin-top:25px;">
          <button id="modalConfirm" class="btn-small" style="min-width: 100px;">OK</button>
          <button id="modalCancel" class="btn-small delete-btn" style="min-width: 100px;">Cancel</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

/**
 * Displays a custom alert using the injected modal.
 * Replaces the browser's default alert/confirm.
 */
function showCustomAlert(title, message, callback, isDelete = false) {
  const modal = document.getElementById("customModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMsg = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("modalConfirm");
  const cancelBtn = document.getElementById("modalCancel");
  const pwdSection = document.getElementById("modalPasswordSection");
  const pwdInput = document.getElementById("modalPasswordInput");

  modalTitle.innerText = title;
  modalMsg.innerText = message;

  if (isDelete) {
    pwdSection.style.display = "block";
    cancelBtn.style.display = "inline-block";
    pwdInput.value = "";
  } else {
    pwdSection.style.display = "none";
    cancelBtn.style.display = "none";
  }

  modal.style.display = "flex";

  confirmBtn.onclick = async () => {
    if (isDelete) {
      const password = pwdInput.value;
      if (!password) {
        // Using the same modal for nested warning
        modalMsg.innerText = "Please enter your password to continue.";
        return;
      }
      if (callback) await callback(password);
    } else {
      modal.style.display = "none";
      if (callback) callback();
    }
  };

  cancelBtn.onclick = () => {
    modal.style.display = "none";
  };
}

/**
 * Updates the navigation bar based on auth status.
 */
function updateNavbar() {
  const token = localStorage.getItem("token");
  const authContainer = document.querySelector(".nav-auth");

  if (token && authContainer) {
    authContainer.innerHTML = "";

    // 1. Edit Link
    const editLi = document.createElement("li");
    editLi.innerHTML = `<a href="signup.html" id="edit-btn">Edit</a>`;
    authContainer.appendChild(editLi);

    // 2. Delete Link
    const deleteLi = document.createElement("li");
    deleteLi.innerHTML = `<a href="#" id="delete-btn">Delete</a>`;
    authContainer.appendChild(deleteLi);

    // 3. Logout Link
    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `<a href="#" id="logout-btn" class="logout-link">Logout</a>`;
    authContainer.appendChild(logoutLi);

    // Event: Logout
    document.getElementById("logout-btn").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });

    // Event: Delete Account
    document.getElementById("delete-btn").addEventListener("click", (e) => {
      e.preventDefault();

      showCustomAlert(
        "Confirm Deletion",
        "⚠️ This action is permanent! Enter your password to delete your account:",
        async (password) => {
          try {
            const response = await fetch("/deleteAccount", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
              showCustomAlert(
                "Success",
                "Account deleted successfully.",
                () => {
                  localStorage.clear();
                  window.location.href = "index.html";
                },
              );
            } else {
              showCustomAlert("Error", data.message || "Incorrect password.");
            }
          } catch (err) {
            showCustomAlert("Error", "Server connection failed.");
          }
        },
        true,
      );
    });
  }
}

/**
 * Protects routes and initializes UI.
 */
function init() {
  const token = localStorage.getItem("token");
  const protectedPages = ["game.html", "scores.html"];
  const currentPage = window.location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage) && !token) {
    window.location.href = "signin.html";
  }

  injectCustomModal();
  updateNavbar();
}

document.addEventListener("DOMContentLoaded", init);
