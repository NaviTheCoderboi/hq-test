#ifndef SIGNAL_H
#define SIGNAL_H

#include <atomic>
#include <functional>

class SignalHandler {
  public:
    static std::atomic<bool> interruptedFlag;

    static void setup(const std::function<void()>& onInterrupt);
    static bool interrupted();
};

#endif
