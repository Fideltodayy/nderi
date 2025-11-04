import TopNavBar from '../TopNavBar';

export default function TopNavBarExample() {
  return (
    <TopNavBar 
      onCheckOut={() => console.log('Check Out clicked')}
      onReturn={() => console.log('Return clicked')}
    />
  );
}
