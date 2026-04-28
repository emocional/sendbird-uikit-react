import React from 'react';
import { render, renderHook, screen,fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MessageInput from "../index";
import { useLocalization } from '../../../lib/LocalizationContext';
import useSendbird from '../../../lib/Sendbird/context/hooks/useSendbird';

const noop = () => {};

// to mock useSendbirdStateContext
jest.mock('../../../lib/Sendbird/context/hooks/useSendbird', () => ({
  __esModule: true,
  default: jest.fn(),
  useSendbird: jest.fn(),
}));
jest.mock('../../../lib/LocalizationContext', () => ({
  ...jest.requireActual('../../../lib/LocalizationContext'),
  useLocalization: jest.fn(),
}));

describe('ui/MessageInput', () => {
  /** Mocking necessary hooks */
  beforeEach(() => {
    const stateContextValue = {
      state: {
        config: {
          groupChannel: {
            enableDocument: true,
          }
        }
      }
    };
    const localeContextValue = {
      stringSet: {},
    };

    useSendbird.mockReturnValue(stateContextValue);
    useLocalization.mockReturnValue(localeContextValue);

    renderHook(() => useSendbird());
    renderHook(() => useLocalization());
  })

  describe('Dashboard enableDocument config', () => {
    it('should not render file upload icon if groupChannel.enableDocument: false', () => {
      const stateContextValue = {
        state: {
          config: {
            groupChannel: {
              enableDocument: false,
            }
          }
        }
      };

      useSendbird.mockReturnValue(stateContextValue);
      renderHook(() => useSendbird());

      const { container } = render(<MessageInput onSendMessage={noop} value=""  channel={{channelType: 'group'}} />);
      expect(
        container.getElementsByClassName('sendbird-message-input--attach').length
      ).toBe(0);
    });

    it('should not render file upload icon if openChannel.enableDocument: false', () => {
      const stateContextValue = {
        state: {
          config: {
            openChannel: {
              enableDocument: false,
            }
          }
        }
      };

      useSendbird.mockReturnValue(stateContextValue);
      renderHook(() => useSendbird());

      const { container } = render(<MessageInput onSendMessage={noop} value="" channel={{channelType: 'open'}} />);
      expect(
        container.getElementsByClassName('sendbird-message-input--attach').length
      ).toBe(0);
    });

    it('should not render file upload icon if openChannel.enableDocument: true', () => {
      const stateContextValue = {
        state: {
          config: {
            openChannel: {
              enableDocument: true,
            }
          }
        }
      };

      useSendbird.mockReturnValue(stateContextValue);
      renderHook(() => useSendbird());

      const { container } = render(<MessageInput onSendMessage={noop} value="" channel={{channelType: 'open'}} />);
      expect(
        container.getElementsByClassName('sendbird-message-input--attach').length
      ).toBe(1);
    });
  })

  it('should render upload icon if no text is present', () => {
    const { container } = render(<MessageInput onSendMessage={noop} value="" />);
    expect(
      container.getElementsByClassName('sendbird-message-input--send').length
    ).toBe(0);
    expect(
      container.getElementsByClassName('sendbird-message-input--attach').length
    ).toBe(1);
    expect(
      container.getElementsByClassName('sendbird-message-input--edit-action').length
    ).toBe(0);
  });

  it("should render upload icon even though only white spaces are present", () => {
    const { container } = render(
      <MessageInput onSendMessage={noop} value="   " />
    );
    expect(
      container.getElementsByClassName("sendbird-message-input--send").length
    ).toBe(0);
    expect(
      container.getElementsByClassName("sendbird-message-input--attach").length
    ).toBe(1);
    expect(
      container.getElementsByClassName("sendbird-message-input--edit-action")
        .length
    ).toBe(0);
  });

  it("should not render the placeholder text if only white spaces are present", async () => {
    const textRef = { current: { textContent: null } };
    const mockText = '   ';
    const { container, rerender } = render(<MessageInput ref={textRef} />);
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, mockText);
    expect(input.textContent).toBe(mockText);

    await rerender(<MessageInput ref={textRef} />);
    expect(
      container.getElementsByClassName("sendbird-message-input--placeholder")
        .length
    ).toBe(0);
  });

  it("should render the placeholder text if there's no text in the input", async() => {
    const textRef = { current: { textContent: null } };
    const { container } = render(<MessageInput ref={textRef} />);

    expect(
      container.getElementsByClassName("sendbird-message-input--placeholder")
        .length
    ).toBe(1);
  });

  it('should call sendMessage with valid string', async () => {
    const onSendMessage = jest.fn();
    const textRef = { current: { innerText: null } };
    const mockText = 'Test Value';

    render(<MessageInput onSendMessage={onSendMessage} ref={textRef} />);

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, mockText);
    expect(input.textContent).toBe(mockText);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSendMessage).toHaveBeenCalledWith({ mentionTemplate: '', message: mockText });
  });

  it('should call sendMessage with valid string; new lines included', async () => {
    const onSendMessage = jest.fn();
    const textRef = { current: { innerText: null } };
    const mockText = '        \nTest Value     \n';

    render(<MessageInput onSendMessage={onSendMessage} ref={textRef} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, mockText);
    expect(input.textContent).toBe(mockText);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSendMessage).toHaveBeenCalledWith({ mentionTemplate: '', message: mockText });
  });

  it('should not call sendMessage with invalid string; only white spaces', async() => {
    const onSendMessage = jest.fn();
    const textRef = { current: { innerText: null } };
    const mockText = '    ';

    render(<MessageInput onSendMessage={onSendMessage} ref={textRef} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, mockText);
    expect(input.textContent).toBe(mockText);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSendMessage).not.toHaveBeenCalledWith({ mentionTemplate: '', message: mockText });
  });

  it('should not call sendMessage with only zero-width spaces', () => {
    const onSendMessage = jest.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByRole('textbox');
    input.textContent = '\u200B';

    fireEvent.input(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSendMessage).not.toHaveBeenCalled();
  });
  
  it('should render send icon if text is present', async() => {
    const onSendMessage = jest.fn();
    const textRef = { current: { innerText: null } };
    const mockText = 'hello';

    const { container } = render(<MessageInput onSendMessage={onSendMessage} ref={textRef} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, mockText);
    expect(input.textContent).toBe(mockText);

    expect(
      container.getElementsByClassName('sendbird-message-input-text-field').length
    ).toBe(1);
    expect(
      container.getElementsByClassName('sendbird-message-input--send').length
    ).toBe(1);
    expect(
      container.getElementsByClassName('sendbird-message-input--attach').length
    ).toBe(0);
    expect(
      container.getElementsByClassName('sendbird-message-input--edit-action').length
    ).toBe(0);
  });

  it('should display save/cancel button on edit mode', () => {
    const messageId = 'aaa';
    const { container } = render(<MessageInput onSendMessage={noop} isEdit message={{ messageId }} />);
    expect(
      container.getElementsByClassName('sendbird-message-input-text-field')[0].id
    ).toBe('sendbird-message-input-text-field' + messageId);
    expect(
      container.getElementsByClassName('sendbird-message-input--send').length
    ).toBe(0);
    expect(
      container.getElementsByClassName('sendbird-message-input--attach').length
    ).toBe(0);
    expect(
      container.getElementsByClassName('sendbird-message-input--edit-action').length
    ).toBe(1);
  });

  describe('typing indicator callbacks', () => {
    it('should call onStartTyping when input has text', () => {
      const onStartTyping = jest.fn();
      const onStopTyping = jest.fn();
      render(<MessageInput onSendMessage={noop} onStartTyping={onStartTyping} onStopTyping={onStopTyping} />);

      const input = screen.getByRole('textbox');
      input.textContent = 'hello';
      fireEvent.input(input);

      expect(onStartTyping).toHaveBeenCalled();
      expect(onStopTyping).not.toHaveBeenCalled();
    });

    it('should call onStopTyping when input becomes empty after typing', () => {
      const onStartTyping = jest.fn();
      const onStopTyping = jest.fn();
      render(<MessageInput onSendMessage={noop} onStartTyping={onStartTyping} onStopTyping={onStopTyping} />);

      const input = screen.getByRole('textbox');
      input.textContent = 'hello';
      fireEvent.input(input);
      input.textContent = '';
      fireEvent.input(input);

      expect(onStartTyping).toHaveBeenCalled();
      expect(onStopTyping).toHaveBeenCalledTimes(1);
    });

    it('should not call onStopTyping when input is empty without prior typing', () => {
      const onStartTyping = jest.fn();
      const onStopTyping = jest.fn();
      render(<MessageInput onSendMessage={noop} onStartTyping={onStartTyping} onStopTyping={onStopTyping} />);

      const input = screen.getByRole('textbox');
      input.textContent = '';
      fireEvent.input(input);
      fireEvent.input(input);

      expect(onStartTyping).not.toHaveBeenCalled();
      expect(onStopTyping).not.toHaveBeenCalled();
    });

    it('should call onStopTyping only once when backspacing repeatedly on empty input', () => {
      const onStartTyping = jest.fn();
      const onStopTyping = jest.fn();
      render(<MessageInput onSendMessage={noop} onStartTyping={onStartTyping} onStopTyping={onStopTyping} />);

      const input = screen.getByRole('textbox');
      input.textContent = 'hi';
      fireEvent.input(input);
      input.textContent = '';
      fireEvent.input(input);
      fireEvent.input(input);
      fireEvent.input(input);

      expect(onStopTyping).toHaveBeenCalledTimes(1);
    });

    it('should call onStopTyping when input becomes whitespace-only after typing', () => {
      const onStartTyping = jest.fn();
      const onStopTyping = jest.fn();
      render(<MessageInput onSendMessage={noop} onStartTyping={onStartTyping} onStopTyping={onStopTyping} />);

      const input = screen.getByRole('textbox');
      input.textContent = 'hello';
      fireEvent.input(input);
      input.textContent = '   ';
      fireEvent.input(input);

      expect(onStopTyping).toHaveBeenCalledTimes(1);
    });

    it('should not call onStartTyping when input contains only whitespace', () => {
      const onStartTyping = jest.fn();
      const onStopTyping = jest.fn();
      render(<MessageInput onSendMessage={noop} onStartTyping={onStartTyping} onStopTyping={onStopTyping} />);

      const input = screen.getByRole('textbox');
      input.textContent = '   ';
      fireEvent.input(input);

      expect(onStartTyping).not.toHaveBeenCalled();
      expect(onStopTyping).not.toHaveBeenCalled();
    });
  });
});

describe('MessageInput error handling', () => {
  beforeEach(() => {
    const stateContextValue = {
      state: {
        config: {
          groupChannel: {
            enableDocument: true,
          },
        },
        eventHandlers: {
          message: {
            onSendMessageFailed: jest.fn(),
            onUpdateMessageFailed: jest.fn(),
            onFileUploadFailed: jest.fn(),
          },
        },
      }
    };
    const localeContextValue = {
      stringSet: {},
    };

    useSendbird.mockReturnValue(stateContextValue);
    useLocalization.mockReturnValue(localeContextValue);

    renderHook(() => useSendbird());
    renderHook(() => useLocalization());
  });

  it('should call onSendMessageFailed when sendMessage throws an error by onKeyDown event', async () => {
    const mockErrorMessage = 'Send message failed';
    const onSendMessage = jest.fn(() => {
      throw new Error(mockErrorMessage);
    });
    const { state: { eventHandlers } } = useSendbird();
    const textRef = { current: { innerText: null } };
    const mockText = 'Test Value';

    render(<MessageInput onSendMessage={onSendMessage} ref={textRef} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, mockText);

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSendMessage).toThrow(mockErrorMessage);
    expect(eventHandlers.message.onSendMessageFailed).toHaveBeenCalled();
  });

  it('should call onSendMessageFailed when sendMessage throws an error by onClick event', async () => {
    const mockErrorMessage = 'Send message failed';
    const onSendMessage = jest.fn(() => {
      throw new Error(mockErrorMessage);
    });
    const { state: { eventHandlers } } = useSendbird();
    const textRef = { current: { innerText: null } };
    const mockText = 'Test Value';

    render(<MessageInput onSendMessage={onSendMessage} ref={textRef} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, mockText);

    const sendIcon = document.getElementsByClassName('sendbird-message-input--send')[0];
    fireEvent.click(sendIcon);

    expect(onSendMessage).toThrow(mockErrorMessage);
    expect(eventHandlers.message.onSendMessageFailed).toHaveBeenCalled();
  });

  it('should call onUpdateMessageFailed when editMessage throws an error', async () => {
    const mockErrorMessage = 'Update message failed';
    const onUpdateMessage = jest.fn(() => {
      throw new Error(mockErrorMessage);
    });
    const { state: { eventHandlers } } = useSendbird();
    const messageId = 123;
    const textRef = { current: { innerText: null } };
    const mockText = 'Updated Text';

    render(
      <MessageInput
        isEdit
        message={{ messageId }}
        onUpdateMessage={onUpdateMessage}
        ref={textRef}
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, mockText);

    const editButton = document.getElementsByClassName('sendbird-message-input--edit-action__save')[0];

    fireEvent.click(editButton);

    expect(onUpdateMessage).toThrow(mockErrorMessage);
    expect(eventHandlers.message.onUpdateMessageFailed).toHaveBeenCalled();
  });

  it('should call onFileUploadFailed when file upload throws an error', async () => {
    const mockErrorMessage = 'File upload failed';
    const onFileUpload = jest.fn(() => {
      throw new Error(mockErrorMessage);
    });
    const { state: { eventHandlers } } = useSendbird();
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

    render(<MessageInput onFileUpload={onFileUpload} />);

    const fileInput = document.getElementsByClassName('sendbird-message-input--attach-input')[0];
  
    fireEvent.change(fileInput, { currentTarget: { files: [file] } });

    expect(onFileUpload).toThrow(mockErrorMessage);
    expect(eventHandlers.message.onFileUploadFailed).toHaveBeenCalled();
  });
});

