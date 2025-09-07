{currentUser ? (
  <div className="pt-2">
    <p className="text-sm text-gray-700 mb-2">Hey, {currentUser.name}!</p>
    <Button
      variant="ghost"
      size="sm"
      onClick={onSignOut}
      className="text-gray-600 hover:text-gray-800"
    >
      Sign Out
    </Button>
  </div>
) : (
  <Button
    variant="ghost"
    className="w-full text-secondary hover:text-secondary/80 justify-center"
    onClick={() => handleNavigation('login')}
  >
    Sign In
  </Button>
)}
