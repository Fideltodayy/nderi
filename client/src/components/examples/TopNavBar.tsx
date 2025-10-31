import TopNavBar from '../TopNavBar';

export default function TopNavBarExample() {
  return (
    <TopNavBar 
      onSearch={(query) => console.log('Search:', query)}
      onCheckOut={() => console.log('Check Out clicked')}
      onReturn={() => console.log('Return clicked')}
    />
  );
}
