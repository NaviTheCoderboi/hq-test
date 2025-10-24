#ifndef SESSION_H
#define SESSION_H

#include "glaze/core/meta.hpp"
#include "glaze/glaze.hpp"

struct Session {
    int id = 0;
    std::string name;
    std::string subject;
    std::string startTime;
    std::string endTime;
    std::optional<std::string> notes;
};

template <> struct glz::meta<Session> {
    using T = Session;
    static constexpr auto value =
        glz::object("id", &T::id, "name", &T::name, "subject", &T::subject, "startTime",
                    &T::startTime, "endTime", &T::endTime, "notes", &T::notes);
};

#endif