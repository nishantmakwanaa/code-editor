/**
 * Room page component that provides collaborative coding environment.
 * Features:
 * - Real-time code synchronization
 * - Multi-cursor support
 * - Resizable panels for editor, terminal, preview
 * - Room-based collaboration
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

'use client';

import { memo, useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { Monaco } from '@monaco-editor/react';
import { Eye, FileText, Terminal as TerminalIcon, Video } from 'lucide-react';
import type * as monaco from 'monaco-editor';

import { CodeServiceMsg, RoomServiceMsg } from '@codex/types/message';
import type { ExecutionResult } from '@codex/types/terminal';
import type { User } from '@codex/types/user';

import { initEditorTheme } from '@/lib/init-editor-theme';
import { userMap } from '@/lib/services/user-map';
import { getSocket } from '@/lib/socket';
import { cn, leaveRoom } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { CodeEditor } from '@/components/code-editor';
import { FollowUser } from '@/components/follow-user';
import { LeaveButton } from '@/components/leave-button';
import { LivePreview } from '@/components/live-preview';
import { MobileCodeToolbar } from '@/components/mobile-code-toolbar';
import { Notepad } from '@/components/notepad';
import { RemotePointers } from '@/components/remote-pointers';
import { RunButton } from '@/components/run-button';
import { SettingsButton } from '@/components/settings-button';
import { ShareButton } from '@/components/share-button';
import { Spinner } from '@/components/spinner';
import { StatusBar, type StatusBarCursorPosition } from '@/components/status-bar';
import { Terminal } from '@/components/terminal';
import { Toolbar } from '@/components/toolbar';
import { UserList } from '@/components/user-list';
import { WebcamStream } from '@/components/webcam-stream';

const MemoizedToolbar = memo(function MemoizedToolbar({
  monaco,
  editor,
  roomId,
  users,
  setOutput,
  showNotepad,
  showTerminal,
  showWebcam,
  showLivePreview,
  setShowNotepad,
  setShowTerminal,
  setShowWebcam,
  setShowLivePreview,
  isMobile
}: {
  monaco: Monaco;
  editor: monaco.editor.IStandaloneCodeEditor;
  roomId: string;
  users: User[];
  setOutput: Dispatch<SetStateAction<ExecutionResult[]>>;
  showNotepad: boolean;
  showTerminal: boolean;
  showWebcam: boolean;
  showLivePreview: boolean;
  setShowNotepad: Dispatch<SetStateAction<boolean>>;
  setShowTerminal: Dispatch<SetStateAction<boolean>>;
  setShowWebcam: Dispatch<SetStateAction<boolean>>;
  setShowLivePreview: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
}) {
  return (
    <div
      className="no-scrollbar fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between gap-x-1
        overflow-x-auto bg-[color:var(--toolbar-bg-secondary)] p-1 shadow-sm sm:gap-x-2"
    >
      <div
        className="animate-fade-in-top flex shrink-0 items-center gap-x-1"
        role="group"
        aria-label="Editor Toolbar"
      >
        <Toolbar
          monaco={monaco}
          editor={editor}
          setShowNotepad={setShowNotepad}
          setShowTerminal={setShowTerminal}
          setShowWebcam={setShowWebcam}
          setShowLivePreview={setShowLivePreview}
          showNotepad={showNotepad}
          showTerminal={showTerminal}
          showWebcam={showWebcam}
          showLivePreview={showLivePreview}
        />
      </div>

      {isMobile && (
        <div className="border-muted-foreground/20 flex shrink-0 items-center gap-x-1 border-x px-1">
          <Button
            variant={showNotepad ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowNotepad(prev => !prev)}
            title="Toggle Notepad"
          >
            <FileText className="size-3.5" />
          </Button>
          <Button
            variant={showLivePreview ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowLivePreview(prev => !prev)}
            title="Toggle Live Preview"
          >
            <Eye className="size-3.5" />
          </Button>
          <Button
            variant={showTerminal ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowTerminal(prev => !prev)}
            title="Toggle Terminal"
          >
            <TerminalIcon className="size-3.5" />
          </Button>
          <Button
            variant={showWebcam ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowWebcam(prev => !prev)}
            title="Toggle Webcam"
          >
            <Video className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-x-1">
        <RunButton monaco={monaco} editor={editor} setOutput={setOutput} />
      </div>

      <nav aria-label="Collaboration Tools" className="flex shrink-0 items-center gap-x-1">
        <div className="flex items-center gap-x-1 sm:gap-x-2">
          <UserList users={users} />
          <ShareButton roomId={roomId} />
          <FollowUser users={users} />
          <SettingsButton monaco={monaco} editor={editor} />
          <LeaveButton />
        </div>
      </nav>
    </div>
  );
});

const MemoizedNotepad = memo(function MemoizedNotepad({ markdown }: { markdown: string }) {
  return <Notepad markdown={markdown} />;
});

const MemoizedTerminal = memo(function MemoizedTerminal({
  results,
  setResults
}: {
  results: ExecutionResult[];
  setResults: Dispatch<SetStateAction<ExecutionResult[]>>;
}) {
  return <Terminal results={results} setResults={setResults} />;
});

const MemoizedWebcamStream = memo(function MemoizedWebcamStream({ users }: { users: User[] }) {
  return <WebcamStream users={users} />;
});

const MemoizedLivePreview = memo(function MemoizedLivePreview({ value }: { value: string }) {
  return <LivePreview value={value} />;
});

const MemoizedStatusBar = memo(function MemoizedStatusBar({
  monaco,
  editor,
  cursorPosition
}: {
  monaco: Monaco;
  editor: monaco.editor.IStandaloneCodeEditor;
  cursorPosition: StatusBarCursorPosition;
}) {
  return <StatusBar monaco={monaco} editor={editor} cursorPosition={cursorPosition} />;
});

export default function Room() {
  const params = useParams();
  const roomId = String(params.roomId);
  const router = useRouter();
  const socket = getSocket();
  useThemeColor();

  const isMobile = useMediaQuery('(max-width: 767px)');

  const [showNotepad, setShowNotepad] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [cursorPosition, setCursorPosition] = useState<StatusBarCursorPosition>({
    line: 1,
    column: 1,
    selected: 0
  });

  const [users, setUsers] = useState<User[]>([]);
  const [defaultCode, setDefaultCode] = useState<string | null>(null);
  const [mdContent, setMdContent] = useState<string | null>(null);
  const [output, setOutput] = useState<ExecutionResult[]>([]);

  // On mobile screens, hide secondary side panels initially so editor gets full focus
  useEffect(() => {
    if (isMobile) {
      setShowNotepad(false);
      setShowWebcam(false);
    }
  }, [isMobile]);

  const disconnect = useCallback(() => {
    leaveRoom();
    socket.disconnect();
  }, [socket]);

  // Memoized socket event handlers
  const handleUsersUpdate = useCallback((usersDict: Record<string, string>) => {
    userMap.clear();
    userMap.addBulk(usersDict);
    setUsers(userMap.getAll());
  }, []);

  const handleCodeReceive = useCallback((code: string) => {
    setDefaultCode(code);
  }, []);

  const handleMarkdownReceive = useCallback((md: string) => {
    setMdContent(md);
  }, []);

  const handleTerminalReceive = useCallback((result: ExecutionResult) => {
    setOutput(prev => [...prev, result]);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      router.replace(`/?room=${roomId}`);
    }

    socket.emit(RoomServiceMsg.SYNC_USERS);
    socket.emit(CodeServiceMsg.SYNC_CODE);
    socket.emit(RoomServiceMsg.SYNC_MD);

    socket.on(RoomServiceMsg.SYNC_USERS, handleUsersUpdate);
    socket.on(CodeServiceMsg.SYNC_CODE, handleCodeReceive);
    socket.on(RoomServiceMsg.UPDATE_MD, handleMarkdownReceive);
    socket.on(CodeServiceMsg.UPDATE_TERM, handleTerminalReceive);

    window.addEventListener('popstate', disconnect);

    initEditorTheme();

    return () => {
      window.removeEventListener('popstate', disconnect);
      socket.off(RoomServiceMsg.SYNC_USERS);
      socket.off(CodeServiceMsg.SYNC_CODE);
      socket.off(CodeServiceMsg.UPDATE_LANG);
      socket.off(RoomServiceMsg.UPDATE_MD);
      socket.off(CodeServiceMsg.UPDATE_TERM);
      userMap.clear();
    };
  }, [
    disconnect,
    roomId,
    router,
    socket,
    handleUsersUpdate,
    handleCodeReceive,
    handleMarkdownReceive,
    handleTerminalReceive
  ]);

  const handleMonacoSetup = useCallback((monacoInstance: Monaco) => {
    setMonaco(monacoInstance);
  }, []);

  const handleEditorSetup = useCallback((editorInstance: monaco.editor.IStandaloneCodeEditor) => {
    setEditor(editorInstance);
  }, []);

  return (
    <main
      className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-[color:var(--panel-background,#111827)]
        md:min-w-[821px]"
      aria-label="Code Editor Workspace"
    >
      <RemotePointers />
      <div
        className="relative z-50 min-h-9 flex-shrink-0"
        role="toolbar"
        aria-label="Editor Controls"
      >
        {monaco && editor && (
          <MemoizedToolbar
            monaco={monaco}
            editor={editor}
            roomId={roomId || ''}
            setOutput={setOutput}
            users={users}
            setShowNotepad={setShowNotepad}
            setShowTerminal={setShowTerminal}
            setShowWebcam={setShowWebcam}
            setShowLivePreview={setShowLivePreview}
            showNotepad={showNotepad}
            showTerminal={showTerminal}
            showWebcam={showWebcam}
            showLivePreview={showLivePreview}
            isMobile={isMobile}
          />
        )}
      </div>
      <div className="min-h-0 w-full flex-1 overflow-hidden pb-6">
        {defaultCode !== null && mdContent !== null ? (
          <ResizablePanelGroup className="h-full w-full min-w-0" direction="vertical">
            {showNotepad && (
              <>
                <ResizablePanel
                  className={cn(
                    'animate-fade-in-left w-full [&>div]:h-full',
                    monaco && editor && 'border-border/30 border-b',
                    (!monaco || !editor) && 'hidden'
                  )}
                  role="region"
                  aria-label="Notepad"
                  collapsible
                  minSize={10}
                  defaultSize={25}
                >
                  <MemoizedNotepad markdown={mdContent} />
                </ResizablePanel>
                <ResizableHandle
                  aria-label="Resize Handle"
                  className={cn((!monaco || !editor) && 'hidden')}
                />
              </>
            )}

            <ResizablePanel defaultSize={55} minSize={15} className="w-full">
              <CodeEditor
                monacoRef={handleMonacoSetup}
                editorRef={handleEditorSetup}
                cursorPosition={setCursorPosition}
                defaultCode={defaultCode}
                setCode={setCode}
              />
            </ResizablePanel>

            {showLivePreview && (
              <>
                <ResizableHandle
                  aria-label="Resize Handle"
                  className={cn((!monaco || !editor) && 'hidden')}
                />
                <ResizablePanel
                  defaultSize={30}
                  minSize={10}
                  collapsible
                  className={cn('animate-fade-in-bottom w-full', (!monaco || !editor) && 'hidden')}
                  role="region"
                  aria-label="Live Preview"
                >
                  {editor && <MemoizedLivePreview value={code || defaultCode} />}
                </ResizablePanel>
              </>
            )}

            {showTerminal && (
              <>
                <ResizableHandle
                  aria-label="Resize Handle"
                  className={cn((!monaco || !editor) && 'hidden')}
                />
                <ResizablePanel
                  className={cn('animate-fade-in-bottom w-full', (!monaco || !editor) && 'hidden')}
                  role="region"
                  aria-label="Terminal"
                  minSize={40}
                  maxSize={60}
                  defaultSize={45}
                >
                  <MemoizedTerminal results={output} setResults={setOutput} />
                </ResizablePanel>
              </>
            )}

            {showWebcam && (
              <>
                <ResizableHandle
                  aria-label="Resize Handle"
                  className={cn((!monaco || !editor) && 'hidden')}
                />
                <ResizablePanel
                  className={cn(
                    'animate-fade-in-right w-full',
                    monaco && editor && 'border-border/30 border-t',
                    (!monaco || !editor) && 'hidden'
                  )}
                  role="region"
                  aria-label="Webcam Stream"
                  collapsible
                  minSize={10}
                  defaultSize={20}
                >
                  <MemoizedWebcamStream users={users} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          <div
            className="fixed left-0 top-0 flex size-full items-center justify-center p-2"
            role="status"
            aria-live="polite"
          >
            <Alert className="bg-background/50 flex max-w-md gap-x-2 backdrop-blur">
              <Spinner className="size-6" />
              <div>
                <AlertTitle>Loading session</AlertTitle>
                <AlertDescription>Loading your coding session. Please wait...</AlertDescription>
              </div>
            </Alert>
          </div>
        )}
      </div>
      {monaco && editor && (
        <MemoizedStatusBar monaco={monaco} editor={editor} cursorPosition={cursorPosition} />
      )}
    </main>
  );
}
