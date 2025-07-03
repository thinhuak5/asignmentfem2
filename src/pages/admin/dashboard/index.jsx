const Dashboard = () =>{
    return (
        <div className="container">
            <h2>Dashboard</h2>
            <div className="row">
                <div className="col-md-4">
                    <div className="card text-white bg-primary mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Tổng bình luận</h5>
                            <p className="card-text">100</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-success mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Bình luận đã duyệt</h5>
                            <p className="card-text">80</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-warning mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Bình luận chờ duyệt</h5>
                            <p className="card-text">20</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dashboard;
