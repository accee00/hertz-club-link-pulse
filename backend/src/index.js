import { app } from "./app.js";

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
})