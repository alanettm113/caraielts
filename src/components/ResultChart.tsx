import { BarChart2 } from 'lucide-react';

const ResultChart: React.FC = () => {
    const results = [
        { date: '29/04/2025', height: '70%' },
        { date: '28/04/2025', height: '65%' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4">
            <h2 className="text-lg font-semibold flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-amber-500" />
            Biểu đồ điểm số
            </h2>
            <div className="flex space-x-4 mt-4">
            {results.map((result, index) => (
                <div key={index} className="flex-1">
                <div className="h-32 bg-amber-200 rounded">
                    <div className="bg-amber-500 rounded" style={{ height: result.height }}></div>
                </div>
                <p className="text-sm text-center mt-2">{result.date}</p>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
};

export default ResultChart;