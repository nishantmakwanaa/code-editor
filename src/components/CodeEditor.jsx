import React, { useRef, useState } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import {
  LoadCodeButton,
  SaveCodeButton,
  LanguageSelector,
  CodeRunnerButton,
} from "./WorkSpaceButtons";
import { CODE_SNIPPETS } from "../constants";
import OutputConsole from "./OutputConsole";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("java");
  const [output, setOutput] = useState("");

  const [editorHeight, setEditorHeight] = useState("60vh");
  const [consoleHeight, setConsoleHeight] = useState("40vh");

  const [isResizing, setIsResizing] = useState(false);
  const [lastClientY, setLastClientY] = useState(0);

  const bgGradient = "linear-gradient(to bottom right, #4F44E0, #32B67A)";

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language] || "");
  };

  const handleLoadCode = (fileContent) => setValue(fileContent);

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const offset = e.clientY - lastClientY;
    const windowHeight = window.innerHeight;
    const newEditorHeight = parseInt(editorHeight) + offset;
    const minHeight = 0;
    const maxHeight = windowHeight - 100;

    if (newEditorHeight >= minHeight && newEditorHeight <= maxHeight) {
      setEditorHeight(`${newEditorHeight}px`);
      setConsoleHeight(`${windowHeight - newEditorHeight - 50}px`);
    }

    setLastClientY(e.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isResizing) return;

    const touch = e.touches[0];
    const offset = touch.clientY - lastClientY;
    const windowHeight = window.innerHeight;
    const newEditorHeight = parseInt(editorHeight) + offset;
    const minHeight = 0;
    const maxHeight = windowHeight - 100;

    if (newEditorHeight >= minHeight && newEditorHeight <= maxHeight) {
      setEditorHeight(`${newEditorHeight}px`);
      setConsoleHeight(`${windowHeight - newEditorHeight - 50}px`);
    }

    setLastClientY(touch.clientY);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setLastClientY(e.clientY);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setLastClientY(e.touches[0].clientY);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleTouchEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isResizing]);

  return (
    <Flex
      direction="column"
      width="100%"
      height="100vh"
      bgGradient={bgGradient}
      color="white"
      overflow="hidden"
    >
      <HStack
        spacing={50}
        px={10}
        py={10}
        bg="rgba(0, 0, 0, 0.7)"
        borderBottom="1px solid"
        borderColor="gray.600"
        justify="center"
        zIndex={2}
        position={"relative"}
      >
        <LoadCodeButton onLoadCode={handleLoadCode} />
        <SaveCodeButton code={value} language={language} />
        <LanguageSelector language={language} onSelect={onSelect} color="red" />
        <CodeRunnerButton
          editorRef={editorRef}
          language={language}
          setValue={setOutput}
        />
      </HStack>
      <Box height={editorHeight} bg="rgba(0, 0, 0, 0.5)" overflow="auto">
        <Editor
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,
          }}
          theme="vs-dark"
          language={language}
          value={value}
          onMount={onMount}
          onChange={(newValue) => setValue(newValue || "")}
        />
      </Box>
      <Box
        className="resizer"
        cursor="row-resize"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        height="10px"
        bg="rgba(0, 0, 0, 0.7)"
      ></Box>
      <Box
        height={consoleHeight}
        bg="rgba(0, 0, 0, 0.7)"
        borderTop="1px solid"
        borderColor="gray.600"
        overflow="auto"
        p={2}
        position="relative"
      >
        <OutputConsole output={output || "Output Will Appear Here..."} />
      </Box>
    </Flex>
  );
};

export default CodeEditor;