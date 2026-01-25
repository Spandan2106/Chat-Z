import { useState, useEffect, useRef } from 'react';

export default function VirtualKeyboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [layout, setLayout] = useState("default");
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 350 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const keys = {
    default: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Backspace"],
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "Enter"],
      ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?"],
      ["Emoji", "Space", "Close"]
    ],
    shift: [
      ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "Backspace"],
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Enter"],
      ["Shift", "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?"],
      ["Emoji", "Space", "Close"]
    ],
    emoji: [
      ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "Backspace"],
      ["😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗"],
      ["😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "Enter"],
      ["🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟"],
      ["ABC", "Space", "Close"]
    ]
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleKeyPress = (key, e) => {
    e.preventDefault(); // Prevent focus loss from input

    if (key === "Close") {
      setIsVisible(false);
      return;
    }

    const activeElement = document.activeElement;
    if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
      return;
    }

    if (key === "Shift") {
      setLayout(layout === "default" ? "shift" : "default");
      return;
    }

    if (key === "Emoji") {
      setLayout("emoji");
      return;
    }

    if (key === "ABC") {
      setLayout("default");
      return;
    }

    if (key === "Enter") {
      if (activeElement.tagName === 'TEXTAREA') {
        // Allow inserting newline in textarea
        key = "\n";
      } else {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          which: 13,
          keyCode: 13,
          bubbles: true,
          cancelable: true
        });
        activeElement.dispatchEvent(event);
        return;
      }
    }

    let start, end, value;
    try {
      start = activeElement.selectionStart;
      end = activeElement.selectionEnd;
      value = activeElement.value;
    } catch {
      // Input type doesn't support selection (e.g. type="number")
      // Fallback: append to end
      value = activeElement.value;
      start = value.length;
      end = value.length;
    }

    let newValue = value;
    let newCursorPos = start;

    if (key === "Backspace") {
      if (start === end && start > 0) {
        newValue = value.slice(0, start - 1) + value.slice(start);
        newCursorPos = start - 1;
      } else if (start !== end) {
        newValue = value.slice(0, start) + value.slice(end);
        newCursorPos = start;
      }
    } else if (key === "Space") {
      newValue = value.slice(0, start) + " " + value.slice(end);
      newCursorPos = start + 1;
    } else {
      newValue = value.slice(0, start) + key + value.slice(end);
      newCursorPos = start + key.length;
    }

    // Trigger React's onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;

    if (activeElement.tagName === 'TEXTAREA') {
      nativeTextAreaValueSetter.call(activeElement, newValue);
    } else {
      nativeInputValueSetter.call(activeElement, newValue);
    }

    const inputEvent = new Event('input', { bubbles: true });
    activeElement.dispatchEvent(inputEvent);

    // Restore cursor position if supported
    try {
      activeElement.setSelectionRange(newCursorPos, newCursorPos);
    } catch {
      // Ignore errors for inputs that don't support selection
    }
  };

  const showKeyboard = () => {
    setPosition(prev => {
      if (prev.y > window.innerHeight || prev.x > window.innerWidth || prev.y < 0 || prev.x < 0) {
        return { x: window.innerWidth / 2 - 300, y: window.innerHeight - 300 };
      }
      return prev;
    });
    setIsVisible(true);
  };

  if (!isVisible) {
    return (
      <button
        onClick={showKeyboard}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#00a884',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontSize: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Open Virtual Keyboard"
      >
        ⌨️
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: position.y,
      left: position.x,
      width: '100%',
      maxWidth: '600px',
      backgroundColor: '#d1d7db',
      padding: '10px',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      userSelect: 'none',
      fontFamily: 'sans-serif',
      borderRadius: '8px'
    }}>
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '5px 10px',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#e9edef',
          borderRadius: '4px',
          marginBottom: '5px'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#54656f' }}>Virtual Keyboard (Drag me)</span>
        <button 
          onClick={() => setIsVisible(false)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#54656f', 
            cursor: 'pointer', 
            fontSize: '14px',
            padding: '5px'
          }}
        >
          ✕ Close
        </button>
      </div>
      {keys[layout].map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {row.map((key) => (
            <button
              key={key}
              onMouseDown={(e) => handleKeyPress(key, e)}
              style={{
                padding: '12px',
                minWidth: key === 'Space' ? '40%' : '8%',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#fff',
                color: '#000',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                flex: key === 'Space' ? 'unset' : 1,
                maxWidth: key === 'Space' ? 'none' : '60px',
                fontSize: '16px',
                fontWeight: ['Shift', 'Enter', 'Backspace', 'Emoji', 'ABC', 'Close'].includes(key) ? 'bold' : 'normal'
              }}
            >
              {key === 'Space' ? 'Space' : key === 'Shift' ? (layout === 'shift' ? '⬆' : '⇧') : key === 'Backspace' ? '⌫' : key === 'Enter' ? '↵' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
