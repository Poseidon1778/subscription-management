import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";

const emptyForm = { fullName: "", email: "", password: "" };

const ROLE_COLORS = {
  admin: "bg-purple-100 text-purple-700",
  internal_user: "bg-blue-100 text-blue-700",
  portal_user: "bg-slate-100 text-slate-700",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data.users))
      .catch(() => setError("Could not load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/admin/internal-users", form);
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create internal user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + New Internal User
        </button>
      </div>

      <p className="text-slate-500 text-sm mb-4">
        Only Admins can create Internal Users. Portal users are created via public signup.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Internal User">
        {formError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Internal User"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
