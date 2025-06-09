// Sample dashboard data - replace this with your database queries
 const dashboardData = {
    // Stats data
    totalUsers: '40,689',
    userGrowth: '8.5',
    totalOrders: '10293',
    orderGrowth: '1.3',
    totalSales: '89,000',
    salesDecline: '4.3',
    
    // Sales chart data
    salesData: {
        labels: ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'],
        values: [20, 25, 45, 50, 35, 40, 55, 85, 40, 45, 55, 50, 65, 75, 60, 55, 50, 45, 25, 20, 45, 65, 55, 50, 45]
    },
    
    // Orders table data
    orders: [
        {
            id: '00001',
            name: 'Christine Brooks',
            address: '089 Kutch Green Apt. 448',
            date: '04 Sep 2019',
            type: 'Men',
            status: 'Completed'
        },
        {
            id: '00002',
            name: 'Rosie Pearson',
            address: '979 Immanuel Ferry Suite 526',
            date: '28 May 2019',
            type: 'Luxury',
            status: 'Processing'
        },
        {
            id: '00003',
            name: 'Darrell Caldwell',
            address: '8587 Frida Ports',
            date: '23 Nov 2019',
            type: 'Women',
            status: 'Rejected'
        }
    ]
};

// Dashboard controller function
export const getDashboard = (req, res) => {
    try {
        // In a real application, you would fetch data from your database here
        // Example:
        // const users = await User.countDocuments();
        // const orders = await Order.find().limit(10);
        // const salesData = await getSalesData();
        
        res.render('Layouts/adminDashboard/adminDashboard', {
            title: 'Dashboard - Chronova',
            dashboardData: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong loading the dashboard'
        });
    }
};

