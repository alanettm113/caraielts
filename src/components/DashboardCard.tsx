import { CheckCircle, Award, Lightbulb } from 'lucide-react';

interface DashboardCardProps {
    type: 'progress' | 'score' | 'suggestion';
    }

    const DashboardCard: React.FC<DashboardCardProps> = ({ type }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {type === 'progress' && (
            <>
            <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 mr-2 text-amber-500" />
                <h2 className="text-lg font-semibold">Tiến độ học tập</h2>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm mt-2">Listening: 60% hoàn thành</p>
            </>
        )}
        {type === 'score' && (
            <>
            <div className="flex items-center mb-2">
                <Award className="w-5 h-5 mr-2 text-amber-500" />
                <h2 className="text-lg font-semibold">Điểm thi gần nhất</h2>
            </div>
            <p className="text-2xl font-bold text-amber-500">6.5</p>
            <p className="text-sm">Overall Score</p>
            </>
        )}
        {type === 'suggestion' && (
            <>
            <div className="flex items-center mb-2">
                <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                <h2 className="text-lg font-semibold">Gợi ý</h2>
            </div>
            <p className="text-sm mb-4">Luyện Writing Task 2 để cải thiện điểm!</p>
            <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600">
                Bắt đầu ngay
            </button>
            </>
        )}
        </div>
    );
};

export default DashboardCard;