type Tab = 'chat' | 'dashboard' | 'services' | 'logs';

interface HeaderProps {
  activeTab: Tab;
}

const Header = ({ activeTab }: HeaderProps) => {
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'chat':
        return null; // No header for chat tab
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Manage your local AI gateway'
        };
      case 'services':
        return {
          title: 'Services',
          subtitle: 'Manage your local AI gateway'
        };
      case 'logs':
        return {
          title: 'Logs',
          subtitle: 'View application logs and troubleshoot issues'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Manage your local AI gateway'
        };
    }
  };

  const content = getHeaderContent();

  // Don't render header for chat tab
  if (!content) {
    return null;
  }

  return (
    <header className="bg-sand-50 px-12 pt-10 pb-6">
      <div>
        <h1 className="text-5xl font-serif font-semibold text-gray-900 mb-2">
          {content.title}
        </h1>
        <p className="text-gray-700 text-base">
          {content.subtitle}
        </p>
      </div>
    </header>
  );
};

export default Header;
