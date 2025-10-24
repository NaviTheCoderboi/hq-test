#ifndef DB_H
#define DB_H

#include "session.h"
#include "sqlite3.h"

#include <memory>
#include <optional>
#include <string>
#include <vector>

class Database {
  private:
    sqlite3* db;
    std::string dbPath;

    bool executeSQL(const std::string& sql);

  public:
    Database(const std::string& dbPath);
    ~Database();

    bool initialize();
    bool isOpen() const;
    void close();

    bool createSession(const Session& session);
    std::vector<Session> getAllSessions();
    bool deleteSession(int id);
};

#endif