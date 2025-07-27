import {useEffect, useState} from "react";
import Constanst from "../../../Constanst";
import {Pie} from "react-chartjs-2";
import {ArcElement, Chart as ChartJS, Legend, Tooltip,} from "chart.js";


ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalComments: 0,
        totalUsers: 0,
        revenue: 0,


    });

    const [orderPriceStats, setOrderPriceStats] = useState({
        below100k: 0,
        from100kTo500k: 0,
        from500kTo1mil: 0,
        over1mil: 0,
    });

    const [orderTypeStats, setOrderTypeStats] = useState({
        canceled: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        delivered: 0,
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/statistics`);
            if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu thống kê");

            const result = await res.json();
            const data = result.data || {};

            setStats({
                totalProducts: data.products ?? 0,
                totalOrders: data.orders ?? 0,
                totalComments: data.reviews ?? 0,
                totalUsers: data.users ?? 0, // Thêm dòng này
                revenue: data.revenue ?? 0,

            });

            setOrderPriceStats({
                below100k: data.orderPriceStats?.below100k ?? 0,
                from100kTo500k: data.orderPriceStats?.from100kTo500k ?? 0,
                from500kTo1mil: data.orderPriceStats?.from500kTo1mil ?? 0,
                over1mil: data.orderPriceStats?.over1mil ?? 0,
            });

            setOrderTypeStats({
                canceled: data.orderTypeStats?.canceled ?? 0,
                pending: data.orderTypeStats?.pending ?? 0,
                confirmed: data.orderTypeStats?.confirmed ?? 0,
                shipping: data.orderTypeStats?.shipping ?? 0,
                delivered: data.orderTypeStats?.delivered ?? 0,
            });

        } catch (err) {
            console.error("Lỗi fetch statistics:", err);
        }
    };

    const priceChartData = {
        labels: ["Dưới 100.000", "100k - 500k", "500k - 1 triệu", "Trên 1 triệu"],
        datasets: [{
            label: "Số đơn hàng",
            data: [
                orderPriceStats.below100k,
                orderPriceStats.from100kTo500k,
                orderPriceStats.from500kTo1mil,
                orderPriceStats.over1mil
            ],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            borderWidth: 1,
        }]
    };

    const typeChartData = {
        labels: ["Đã huỷ", "Chờ xác nhận", "Đã xác nhận", "Đang giao hàng", "Đã giao hàng"],
        datasets: [{
            label: "Trạng thái đơn hàng",
            data: [
                orderTypeStats.canceled,
                orderTypeStats.pending,
                orderTypeStats.confirmed,
                orderTypeStats.shipping,
                orderTypeStats.delivered
            ],
            backgroundColor: ["#F44336", "#FF9800", "#2196F3", "#FFC107", "#4CAF50"],
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {position: "bottom"},
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.parsed} đơn`
                }
            }
        }
    };

    return (
        <div className="container">
            <h2 className="mt-4">Dashboard Thống kê</h2>

            {/* Các thẻ tổng quan */}
            <div className="row row-cols-1 row-cols-md-5 g-4 mt-4">
                <div className="col">
                    <div className="card text-white bg-primary h-100">
                        <div className="card-body">
                            <h5 className="card-title">Tổng bình luận</h5>
                            <p className="card-text">{stats.totalComments}</p>
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body">
                            <h5 className="card-title">Tổng sản phẩm</h5>
                            <p className="card-text">{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="card text-white bg-warning h-100">
                        <div className="card-body">
                            <h5 className="card-title">Tổng đơn hàng</h5>
                            <p className="card-text">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="card text-white bg-info h-100">
                        <div className="card-body">
                            <h5 className="card-title">Tổng tài khoản</h5>
                            <p className="card-text">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="card text-white bg-danger h-100">
                        <div className="card-body">
                            <h5 className="card-title">Tổng doanh thu</h5>
                            <p className="card-text">{stats.revenue.toLocaleString()} đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Phân loại theo giá trị đơn hàng</h5>
                            <Pie data={priceChartData} options={chartOptions}/>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Trạng thái đơn hàng</h5>
                            <Pie data={typeChartData} options={chartOptions}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Dashboard;
