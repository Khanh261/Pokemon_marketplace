import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search Pokemon...')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Search Pokemon...'), {
      target: { value: 'Pika' },
    });
    expect(onChange).toHaveBeenCalledWith('Pika');
  });

  it('displays the current value', () => {
    render(<SearchBar value="Charizard" onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Charizard')).toBeInTheDocument();
  });
});
