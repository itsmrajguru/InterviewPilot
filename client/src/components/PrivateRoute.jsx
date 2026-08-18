import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children, role }) {
    const token = localStorage.getItem('token')
    const user  = JSON.parse(localStorage.getItem('user') || 'null')

    if (!token || !user) {
        return <Navigate to="/login" replace />
    }

    if (role && user.role !== role) {
        if (user.role === 'company') return <Navigate to="/company/dashboard" replace />
        if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
        return <Navigate to="/login" replace />
    }

    return children
}
