import {useEffect, useState} from "react";
import Constanst from "../../../Constanst";
import {Bar, Pie} from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";

// Đăng ký các thành phần & plugin cần thiết cho chartjs
ChartJS.register(
    ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
    BarElement, LineElement, PointElement, Filler, ChartDataLabels
);

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

    // State cho biểu đồ earnings/orders/refunds
    const [weeklyLabels, setWeeklyLabels] = useState([]);
    const [weeklyRevenue, setWeeklyRevenue] = useState([]);
    const [weeklyOrders, setWeeklyOrders] = useState([]);
    const [weeklyRefunds, setWeeklyRefunds] = useState([]);
    const [totalWeeklyRevenue, setTotalWeeklyRevenue] = useState(0);

    useEffect(() => {
        fetchStatistics();
        fetchWeeklyRevenue();
    }, []);

    // Lấy dữ liệu thống kê tổng quan & trạng thái đơn
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
                totalUsers: data.users ?? 0,
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

    // Lấy dữ liệu VNĐ/Đơn hàng/Đơn đã hủy
    const fetchWeeklyRevenue = async () => {
        try {
            const res = await fetch(`${Constanst.DOMAIN_API}/api/statistics/weekly-revenue`);
            if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu doanh thu tuần");
            const result = await res.json();
            const {labels, data, total, orders, refunds} = result;
            setWeeklyLabels(labels);
            setWeeklyRevenue(data);
            setTotalWeeklyRevenue(total);
            setWeeklyOrders(orders || []);
            setWeeklyRefunds(refunds || []);
        } catch (err) {
            // Dữ liệu demo
            setWeeklyLabels([
                "T2", "T3", "T4", "T5", "T6", "T7", "CN"
            ]);
            setWeeklyRevenue([900000, 1000000, 700000, 1100000, 780000, 830000, 500000]);
            setWeeklyOrders([3, 4, 2, 5, 7, 3, 6]);
            setWeeklyRefunds([1, 1, 2, 3, 1, 2, 1]);
            setTotalWeeklyRevenue(5_540_000);
        }
    };

    // Fallback line data nếu dữ liệu quá ít hoặc toàn 0
    const getLineSafe = (arr, fake) =>
        (Array.isArray(arr) && arr.filter(x => x > 0).length >= 2)
            ? arr
            : fake;

    // Chọn số điểm cho dữ liệu line fallback = số ngày revenue hiện tại
    const fallbackLength = weeklyRevenue.length > 0 ? weeklyRevenue.length : 7;
    const fakeOrders = Array.from({length: fallbackLength}, (_, i) => (i * 2) % 7 + 2);
    const fakeRefunds = Array.from({length: fallbackLength}, (_, i) => i % 3 + 1);

    const ordersData = getLineSafe(weeklyOrders, fakeOrders);
    const refundsData = getLineSafe(weeklyRefunds, fakeRefunds);

    // Tính max y (giới hạn trục Y)
    const maxY = Math.max(...weeklyRevenue, ...(ordersData.map(x => x * 1e6 / 7)), ...(refundsData.map(x => x * 1e6 / 7)));
    const yMax = Math.ceil((maxY + 1e5) / 1e6) * 1e6;

    // Dữ liệu biểu đồ kết hợp
    const weeklyBarData = {
        labels: weeklyLabels.length === fallbackLength ? weeklyLabels : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [
            {
                type: "bar",
                label: "VNĐ",
                data: weeklyRevenue,
                backgroundColor: "#26C6DA",
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.5,
                borderSkipped: false,
                order: 1,
                yAxisID: "y"
            },
            {
                type: "line",
                label: "Đơn hàng",
                data: ordersData,
                borderColor: "#25396f",
                backgroundColor: "rgba(37,57,111,0.09)",
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
                order: 2,
                yAxisID: "y1"
            },
            {
                type: "line",
                label: "Đơn đã hủy",
                data: refundsData,
                borderColor: "#ff715b",
                borderDash: [6, 6],
                fill: false,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2,
                order: 3,
                yAxisID: "y1"
            }
        ]
    };

    // Tùy chỉnh legend, tooltip, scales, KHÔNG hiện số trên cột/line
    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    font: {size: 16, weight: "500"},
                    usePointStyle: true,
                    padding: 30,
                    color: "#25396f",
                }
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    title: function (context) {
                        return context[0]?.label || "";
                    },
                    label: function (context) {
                        if (context.dataset.label === "VNĐ") {
                            return ` VNĐ:  ${context.parsed.y.toLocaleString()} đ`;
                        }
                        if (context.dataset.label === "Đơn hàng") {
                            return ` Đơn hàng:  ${context.parsed.y}`;
                        }
                        if (context.dataset.label === "Đơn đã hủy") {
                            return ` Đơn đã hủy:  ${context.parsed.y}`;
                        }
                        return "";
                    },
                    labelColor: function (context) {
                        if (context.dataset.label === "Đơn hàng")
                            return {borderColor: "#25396f", backgroundColor: "#25396f"};
                        if (context.dataset.label === "VNĐ")
                            return {borderColor: "#26C6DA", backgroundColor: "#26C6DA"};
                        if (context.dataset.label === "Đơn đã hủy")
                            return {borderColor: "#ff715b", backgroundColor: "#ff715b"};
                        return {borderColor: "#222", backgroundColor: "#222"};
                    }
                }
            },
            datalabels: {display: false}
        },
        scales: {
            x: {
                grid: {display: false},
                ticks: {font: {size: 15}, color: "#737791"},
            },
            y: {
                beginAtZero: true,
                type: "linear",
                position: "left",
                grid: {color: "#f2f2f2"},
                title: {
                    display: true,
                    text: "VNĐ",
                    color: "#26C6DA",
                    font: {size: 14, weight: "bold"}
                },
                ticks: {
                    font: {size: 13},
                    color: "#26C6DA",
                    callback: value => value.toLocaleString()
                },
                max: yMax,
            },
            y1: {
                beginAtZero: true,
                type: "linear",
                position: "right",
                grid: {display: false},
                title: {
                    display: true,
                    text: "Đơn hàng / Đơn đã hủy",
                    color: "#25396f",
                    font: {size: 14, weight: "bold"}
                },
                ticks: {
                    font: {size: 13},
                    color: "#25396f",
                    callback: value => value.toLocaleString()
                },
                min: 0,
            }
        }
    };

    // ----------- Biểu đồ Doughnut -----------

    const doughnutColors1 = ["#324d78", "#20bfa9", "#ffc75b", "#ff6f5e"];
    const doughnutColors2 = ["#f44336", "#ff9800", "#2196f3", "#ffc107", "#4caf50"];

    const priceDoughnutData = {
        labels: ["Dưới 100.000", "100k - 500k", "500k - 1 triệu", "Trên 1 triệu"],
        datasets: [{
            data: [
                orderPriceStats.below100k,
                orderPriceStats.from100kTo500k,
                orderPriceStats.from500kTo1mil,
                orderPriceStats.over1mil
            ],
            backgroundColor: doughnutColors1,
            borderWidth: 0,
        }]
    };

    const typeDoughnutData = {
        labels: ["Đã huỷ", "Chờ xác nhận", "Đã xác nhận", "Đang giao hàng", "Đã giao hàng"],
        datasets: [{
            data: [
                orderTypeStats.canceled,
                orderTypeStats.pending,
                orderTypeStats.confirmed,
                orderTypeStats.shipping,
                orderTypeStats.delivered
            ],
            backgroundColor: doughnutColors2,
            borderWidth: 0,
        }]
    };

    const doughnutOptions = {
        cutout: "70%",
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {size: 16}
                }
            },
            datalabels: {
                color: "#fff",
                font: {weight: "bold", size: 18},
                formatter: (value, ctx) => {
                    const dataArr = ctx.chart.data.datasets[0].data;
                    const total = dataArr.reduce((a, b) => a + b, 0);
                    if (!total) return "0%";
                    const pct = (value / total * 100);
                    return pct >= 1 ? `${pct.toFixed(1)}%` : "";
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || "";
                        const value = context.parsed;
                        return ` ${label}: ${value.toLocaleString()} đơn`;
                    }
                }
            }
        }
    };

    // -----------------------------------

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

            {/* Biểu đồ Doughnut */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Phân loại theo giá trị đơn hàng</h5>
                            <Pie data={priceDoughnutData} options={doughnutOptions} plugins={[ChartDataLabels]}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Trạng thái đơn hàng</h5>
                            <Pie data={typeDoughnutData} options={doughnutOptions} plugins={[ChartDataLabels]}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ VNĐ, Đơn hàng, Đơn đã hủy */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Bảng thống kê (7 ngày)</h5>
                            <Bar data={weeklyBarData} options={barOptions} height={90}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-end mt-2 fw-bold">
                Tổng VNĐ: <span style={{color: "#39FF14"}}>{totalWeeklyRevenue.toLocaleString()} VNĐ</span>
            </div>
        </div>
    );
};

export default Dashboard;
