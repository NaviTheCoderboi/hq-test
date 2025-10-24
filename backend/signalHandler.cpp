#include "signalHandler.h"

#include <atomic>
#include <chrono>
#include <functional>
#include <iostream>
#include <thread>

#ifdef _WIN32
#include <windows.h>
#else
#include <csignal>
#endif

std::atomic<bool> SignalHandler::interruptedFlag = false;

#ifdef _WIN32
static BOOL WINAPI consoleHandler(DWORD signal) {
    if (signal == CTRL_C_EVENT || signal == CTRL_BREAK_EVENT || signal == CTRL_CLOSE_EVENT) {
        SignalHandler::interruptedFlag = true;
        return TRUE;
    }
    return FALSE;
}
#else
static void sigintHandler(int) {
    SignalHandler::interruptedFlag = true;
}
#endif

void SignalHandler::setup(const std::function<void()>& onInterrupt) {
#ifdef _WIN32
    SetConsoleCtrlHandler(consoleHandler, TRUE);
#else
    std::signal(SIGINT, sigintHandler);
#endif

    std::thread([onInterrupt]() {
        while (!interruptedFlag) {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        }
        if (onInterrupt) {
            onInterrupt();
        }
    }).detach();
}

bool SignalHandler::interrupted() {
    return interruptedFlag.load();
}
