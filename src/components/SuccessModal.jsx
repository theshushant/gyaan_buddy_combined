import { Check, Plus, ArrowRight, User, X } from 'lucide-react'

const SuccessModal = ({ isOpen, onClose, type, title, message, detail, actions }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/5 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Close Icon */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Success Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-2">{message}</p>
              {detail && <p className="text-sm text-gray-500">{detail}</p>}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {actions?.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </button>
              ))}
              
              {actions?.length > 2 && (
                <button
                  onClick={actions[2].onClick}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {actions[2].label}
                </button>
              )}

              {/* Default OK button when no actions are provided */}
              {(!actions || actions.length === 0) && (
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
