const GITHUB = 'https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager';

export default function Footer() {
  return (
    <footer className="border-t border-sand-300/50 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img
              src="/icons8-hedgehog-100.png"
              alt="Spike"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-sans font-semibold text-gray-900">Spike</span>
          </div>
          <p className="text-xs text-gray-500">
            Open source · MIT licensed · Made for the AI community
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href={`${GITHUB}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            Releases
          </a>
          <a
            href={`${GITHUB}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            Issues
          </a>
          <a
            href={`${GITHUB}/blob/main/API_DOCUMENTATION.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            API Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
