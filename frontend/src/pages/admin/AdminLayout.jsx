import AdminSidebar from './AdminSidebar'
import './Admin.css'
import './AdminSidebar.css'

function AdminLayout({ children, title, subtitle }) {
    return (
        <div className="admin-with-sidebar">
            <AdminSidebar />
            <div className="admin-main-content">
                <div className="dashboard-body">
                    {title && (
                        <div className="admin-page-header">
                            <h1>{title}</h1>
                            {subtitle && <p>{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout
