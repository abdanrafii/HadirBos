type StatsCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
};

const StatsCard = ({ title, value, icon } : StatsCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-blue-800">{value}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;