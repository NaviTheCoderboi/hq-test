#include "bridge.h"

#include "db.h"
#include "dnd.h"
#include "glaze/glaze.hpp"
#include "glaze/json.hpp"
#include "session.h"

std::unique_ptr<Database> Bridge::database{};

bool Bridge::initializeDatabase(const std::string& dbPath) {
    try {
        std::filesystem::create_directories(std::filesystem::path{dbPath}.parent_path());

        database = std::make_unique<Database>(dbPath);
        database->initialize();
        return true;
    } catch (const std::exception& e) {
        return false;
    }
}

bool Bridge::closeDatabase() {
    try {
        if (database) {
            database->close();
            database.reset();
        }
        return true;
    } catch (const std::exception& e) {
        return false;
    }
}

bool Bridge::enableDoNotDisturb() {
    try {
        return dnd::enableDoNotDisturb();
    } catch (const std::exception& e) {
        return false;
    }
}

bool Bridge::disableDoNotDisturb() {
    try {
        return dnd::disableDoNotDisturb();
    } catch (const std::exception& e) {
        return false;
    }
}

bool Bridge::createSession(const std::string& toCreate) {
    try {
        Session toInsert{};

        glz::read_json(toInsert, toCreate);

        bool success{database->createSession(toInsert)};

        return success;
    } catch (const std::exception& e) {
        return false;
    }
}

std::string Bridge::getAllSessions() {
    try {
        std::string result{};

        auto sessions = database->getAllSessions();

        glz::write_json(sessions, result);

        return result;
    } catch (const std::exception& e) {
        return "[]";
    }
}

bool Bridge::deleteSession(int id) {
    try {
        bool success{database->deleteSession(id)};

        return success;
    } catch (const std::exception& e) {
        return false;
    }
}

void Bridge::registerFunctions(saucer::smartview<>& webview) {
    webview.expose("createSession", &Bridge::createSession);
    webview.expose("getAllSessions", &Bridge::getAllSessions);
    webview.expose("deleteSession", &Bridge::deleteSession);
    webview.expose("enableDoNotDisturb", &Bridge::enableDoNotDisturb);
    webview.expose("disableDoNotDisturb", &Bridge::disableDoNotDisturb);
}