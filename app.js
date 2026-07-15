const API_URL = "https://dbdregionpanelapi-1.onrender.com";
let allKeys = [];

async function fetchKeys() {
    try {
        const res = await fetch(`${API_URL}/keys`);
        allKeys = await res.json();
        renderKeys(allKeys);
        updateStats(allKeys);
    } catch (e) {
        console.error("Error loading keys:", e);
    }
}

function updateStats(keys) {
    document.getElementById("total-keys").textContent = keys.length;
    document.getElementById("active-keys").textContent = keys.filter(k => k.status === "si").length;
    document.getElementById("inactive-keys").textContent = keys.filter(k => k.status === "no").length;
}

function renderKeys(keys) {
    const tbody = document.getElementById("keys-body");
    if (keys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No keys found.</td></tr>';
        return;
    }

    tbody.innerHTML = keys.map(k => `
        <tr>
            <td class="key">${k.key}</td>
            <td>${getBadge(k.status)}</td>
            <td>${k.hwid || "—"}</td>
            <td>${k.activated_at || "—"}</td>
            <td>${k.last_session || "—"}</td>
            <td>
                ${k.status === "si" ? `<button class="danger" onclick="revokeKey(${k.row})">Revoke</button>` : ""}
                <button class="secondary" onclick="deleteKey(${k.row})">Delete</button>
            </td>
        </tr>
    `).join("");
}

function getBadge(status) {
    if (status === "si") return '<span class="badge active">Active</span>';
    if (status === "admin") return '<span class="badge admin">Admin</span>';
    return '<span class="badge inactive">Inactive</span>';
}

function filterKeys() {
    const query = document.getElementById("search").value.toLowerCase();
    const filtered = allKeys.filter(k => 
        k.key.toLowerCase().includes(query) ||
        k.hwid.toLowerCase().includes(query)
    );
    renderKeys(filtered);
}

async function revokeKey(row) {
    if (!confirm("Revoke this key?")) return;
    await fetch(`${API_URL}/keys/${row}/revoke`, { method: "POST" });
    loadKeys();
}

async function deleteKey(row) {
    if (!confirm("Delete this key?")) return;
    await fetch(`${API_URL}/keys/${row}/delete`, { method: "DELETE" });
    loadKeys();
}

function showGenerateModal() {
    document.getElementById("generate-modal").classList.add("open");
    document.getElementById("generated-keys-list").innerHTML = "";
}

function closeModal() {
    document.getElementById("generate-modal").classList.remove("open");
}

async function generateKeys() {
    const amount = parseInt(document.getElementById("generate-amount").value);
    const res = await fetch(`${API_URL}/keys/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });
    const data = await res.json();
    const list = document.getElementById("generated-keys-list");
    list.innerHTML = data.keys.map(k => `
        <div class="generated-key"> onclick="copyKey(this, '${k}')">${k}</div>
        `).join("");
        loadKeys();
}

function copyKey(el, key) {
    navigator.clipboard.writeText(key);
    el.classList.add("copied");
    el.textContent = "Copied!";
    setTimeout(() => {
        el.classList.remove("copied");
        el.textContent = key;
    }, 2000);
}

windo.onload = loadKeys;