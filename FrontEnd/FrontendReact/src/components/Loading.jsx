export const Loading = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
};

export const Skeleton = ({ width = 'w-full', height = 'h-4' }) => {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
  );
};
