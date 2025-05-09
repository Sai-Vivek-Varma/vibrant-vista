
interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const headings = content.split('\n\n')
    .filter(para => para.startsWith('## '))
    .map((heading, i) => ({
      id: `heading-${i}`,
      title: heading.substring(3),
      index: i + 1
    }));
    
  if (headings.length === 0) {
    return null;
  }
    
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border shadow-sm">
      <h3 className="text-lg font-bold font-serif mb-4">Table of Contents</h3>
      <nav className="toc-nav">
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a 
                href={`#${heading.id}`}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <span className="w-5 inline-block">{heading.index}.</span>
                <span>{heading.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
