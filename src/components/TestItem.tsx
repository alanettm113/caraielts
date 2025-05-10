import { FileText, Play } from 'lucide-react';

interface TestItemProps {
    title: string;
    duration: string;
    }

    const TestItem: React.FC<TestItemProps> = ({ title, duration }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-amber-500" />
            <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-gray-600">Thời gian: {duration}</p>
            </div>
        </div>
        <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600">
            <Play className="w-5 h-5 inline mr-2" />
            Bắt đầu
        </button>
        </div>
    );
};

export default TestItem;