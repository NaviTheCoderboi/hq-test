#ifndef BRIDGE_H
#define BRIDGE_H

#include "db.h"

#include <memory>
#include <saucer/smartview.hpp>
#include <string>

class Bridge {
  public:
    static bool initializeDatabase(const std::string& dbPath);
    static bool closeDatabase();

    static bool createSession(const std::string& toCreate);
    static std::string getAllSessions();
    static bool deleteSession(int id);

    static bool enableDoNotDisturb();
    static bool disableDoNotDisturb();

    static void registerFunctions(saucer::smartview<>& webview);

  private:
    static std::unique_ptr<Database> database;
};

#endif