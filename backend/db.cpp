#include "db.h"

#include <iostream>
#include <sstream>

Database::Database(const std::string& dbPath) : db{nullptr}, dbPath{dbPath} {}

Database::~Database() {
    close();
}

bool Database::isOpen() const {
    return db != nullptr;
}

void Database::close() {
    if (db != nullptr) {
        sqlite3_close(db);
        db = nullptr;
    }
}

bool Database::executeSQL(const std::string& sql) {
    char* errMsg{};
    int rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);

    if (rc != SQLITE_OK) {
        sqlite3_free(errMsg);
        return false;
    }

    return true;
}

bool Database::initialize() {
    int rc = sqlite3_open(dbPath.c_str(), &db);

    if (rc != SQLITE_OK) {
        return false;
    }

    const std::string createTableSQL{
        R"(
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    )"};

    const std::string createIndexSQL{
        R"(
        CREATE INDEX IF NOT EXISTS idx_subject ON sessions(subject);
        CREATE INDEX IF NOT EXISTS idx_start_time ON sessions(start_time);
    )"};

    if (!executeSQL(createTableSQL)) {
        return false;
    }

    if (!executeSQL(createIndexSQL)) {
        return false;
    }

    return true;
}

bool Database::createSession(const Session& session) {
    const char* sql{
        R"(
        INSERT INTO sessions (name, subject, start_time, end_time, notes)
        VALUES (?, ?, ?, ?, ?);
    )"};

    sqlite3_stmt* stmt{};
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr);

    if (rc != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_text(stmt, 1, session.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, session.subject.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, session.startTime.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, session.endTime.c_str(), -1, SQLITE_TRANSIENT);

    if (session.notes.has_value()) {
        sqlite3_bind_text(stmt, 5, session.notes.value().c_str(), -1, SQLITE_TRANSIENT);
    } else {
        sqlite3_bind_null(stmt, 5);
    }

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return false;
    }

    return true;
}

std::vector<Session> Database::getAllSessions() {
    std::vector<Session> sessions{};

    const char* sql{
        R"(
        SELECT id, name, subject, start_time, end_time, notes
        FROM sessions
        ORDER BY start_time DESC;
    )"};

    sqlite3_stmt* stmt{};
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr);

    if (rc != SQLITE_OK) {
        return sessions;
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Session session{};
        session.id = sqlite3_column_int(stmt, 0);
        session.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        session.subject = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        session.startTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        session.endTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));

        const char* notes = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        if (notes != nullptr) {
            session.notes = std::string(notes);
        }

        sessions.push_back(session);
    }

    sqlite3_finalize(stmt);
    return sessions;
}

bool Database::deleteSession(int id) {
    const char* sql{"DELETE FROM sessions WHERE id = ?;"};

    sqlite3_stmt* stmt{};
    int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr);

    if (rc != SQLITE_OK) {
        return false;
    }

    sqlite3_bind_int(stmt, 1, id);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return false;
    }

    return sqlite3_changes(db) > 0;
}