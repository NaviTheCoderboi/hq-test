#include "bridge.h"
#include "fs.h"
#include "saucer/embedded/all.hpp"
#include "saucer/smartview.hpp"
#include "saucer/window.hpp"
#include "signalHandler.h"

#include <filesystem>
#include <memory>
#include <print>

coco::stray start(saucer::application* app) {
    SignalHandler signalHandler{};
    signalHandler.setup([&app] {
        std::print("Interrupt signal received. Shutting down...\n");
        app->quit();
    });

    auto dataDir{fs::getDataDirectory() / "TheHQProject"};
    std::print("Application started\n");
    std::print("Data Directory: {}\n", dataDir.string());

    auto window{saucer::window::create(app).value()};
    auto webview{saucer::smartview<>::create({.window = window})};

    window->set_title("The HQ Project");
    window->set_decorations(saucer::window::decoration::full);

    auto dbPath{dataDir / "app.db"};
    Bridge::initializeDatabase(dbPath.string());
    Bridge::registerFunctions(*webview);

    window->on<saucer::window::event::closed>([] {
        Bridge::closeDatabase();
        std::print("Application closed.\n");
    });

    webview->embed(saucer::embedded::all());
    webview->serve("/index.html");

    window->on<saucer::window::event::resize>([&window, &webview](int width, int height) {
        window->set_size({
            .w = width,
            .h = height,
        });
        webview->set_bounds({
            .x = 0,
            .y = 0,
            .w = width,
            .h = height,
        });
    });

    webview->set_dev_tools(false);

    window->show();

    co_await app->finish();
}

int main() {
    return saucer::application::create({.id = "hello-world"})->run(start);
}

#ifdef _WIN32
#include <windows.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd) {
    return main();
}

#endif