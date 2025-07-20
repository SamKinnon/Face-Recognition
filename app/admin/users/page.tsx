"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"

type User = {
  id: number
  fullName: string
  address: string
  nationalId: string
  email?: string
  role: "ADMIN" | "VOTER"
  createdAt: string
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"success" | "error" | "">("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data)
    } catch {
      setMessage("Failed to load users.")
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: "ADMIN" | "VOTER") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("Role updated.")
        setStatus("success")
        fetchUsers()
      } else {
        setMessage(data.error || "Failed to update role.")
        setStatus("error")
      }
    } catch {
      setMessage("Server error.")
      setStatus("error")
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("User deleted.")
        setStatus("success")
        fetchUsers()
      } else {
        setMessage(data.error || "Failed to delete user.")
        setStatus("error")
      }
    } catch {
      setMessage("Server error.")
      setStatus("error")
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">👤 Registered Users</h2>

      {status && (
        <Alert className="mb-4">
          {status === "success" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow bg-white">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th className="px-4 py-2">Full Name</th>
                <th className="px-4 py-2">National ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Registered</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.nationalId}</td>
                  <td className="px-4 py-2">{user.email || "—"}</td>
                  <td className="px-4 py-2">
                    <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val as "ADMIN" | "VOTER")}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VOTER">VOTER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}