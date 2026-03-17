const ParentHelp = () => {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">Help</h1>
        <p className="text-gray-500 mt-1">Quick guidance for using the parent dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reading Scores</h2>
          <p className="text-sm text-gray-600">Scores are shown as percentage and performance labels. Use Test Scores for test-by-test breakdown.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reports</h2>
          <p className="text-sm text-gray-600">See trend lines, subject accuracy, and module completion to track progress over time.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Tests</h2>
          <p className="text-sm text-gray-600">Dashboard highlights upcoming test dates based on data from assigned class tests.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Need More Support?</h2>
          <p className="text-sm text-gray-600">Contact the school administrator or class teacher for account, schedule, or curriculum related questions.</p>
        </div>
      </div>
    </div>
  )
}

export default ParentHelp
