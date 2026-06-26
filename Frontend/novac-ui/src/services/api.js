const BASE_URL = "http://localhost:5255/api";

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function getPermissions() {
  const res = await fetch(`${BASE_URL}/user/permissions`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  if (!res.ok) {
    return [];
  }

  const text = await res.text();
  return text ? JSON.parse(text) : [];
}