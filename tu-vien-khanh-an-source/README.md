# Tu viện Khánh An

Game 3D tiếng Việt sử dụng Three.js, Vite và máy chủ WebSocket.

## Chạy dự án

```sh
npm install
npm run dev
```

Mở http://localhost:5173. Các thiết bị cùng mạng có thể truy cập địa chỉ IP của máy chủ, cổng 5173. Mỗi cửa sổ có một người chơi riêng. Để chơi qua Internet, triển khai máy chủ Node.js có HTTPS và hỗ trợ WebSocket; không chỉ đăng thư mục dist lên hosting tĩnh.

```sh
npm run build
npm start
npm test
```

Có thể đặt biến PORT để đổi cổng (mặc định 5173).

Xuất bản miễn phí có địa chỉ cố định: xem `DEPLOY.md` và cấu hình Render Web Service trong `render.yaml`. Cần đăng nhập/kết nối tài khoản hosting và repository của chủ dự án; link đường hầm tạm không phải hosting độc lập.

Chuỗi hạt chỉ hiện khi nhân vật đứng nghỉ, tự cất khi đi, nhảy, quỳ, lạy, dâng nhang, cho cá ăn, quét lá hoặc ngồi bồ đoàn; áp dụng cả nhân vật của người chơi khác.

## Chức năng

- Di chuyển WASD/phím mũi tên, kéo xoay góc nhìn, cuộn thu phóng, nút di chuyển cảm ứng.
- Nhảy (Space), quỳ (Q), lạy Phật (E), dâng nhang gần lư hương (R).
- Cửa hàng (B) với điểm ảo, lưu vật phẩm trên trình duyệt; hoa/nến được đặt lên bàn lễ khi mua trong phiên chơi.
- Nhân vật nữ chibi áo lam, tóc dài cài hoa trắng, khăn vàng chéo vai; đổi màu áo và tên.
- Đồng bộ vị trí, hành động và trò chuyện qua WebSocket; tự kết nối lại.
- Nhạc nền YouTube dùng lại video `lmYlOxyOESw`, có khung phát, nút ♫ và thanh âm lượng. Nếu tự phát bị chặn, dùng nút phát trong khung. Âm nghi lễ dùng Web Audio riêng, điều khiển bằng ♪; lưu lựa chọn tại máy.

## Phạm vi hiện tại

Cảnh và nhân vật đã được cập nhật theo bốn ảnh tham khảo người dùng cung cấp: ảnh chính điện, giao diện game, bảng nhân vật chibi và phối cảnh tu viện. Mô hình hình học cách điệu có cột gỗ trang trí vàng, ba tượng Phật, đệm quỳ, mái ba tầng, hành lang, hồ sen, tháp chuông và Tháp Tổ; không phải bản khảo sát kiến trúc hoặc bản sao chi tiết từng pixel. Địa chỉ hiển thị Quận 12, TP. Hồ Chí Minh. Chưa có tài khoản, phòng riêng, kiểm duyệt trò chuyện hoặc dữ liệu vật phẩm phía máy chủ. Tên và vật phẩm lưu ở trình duyệt; người chơi trực tuyến lưu trong bộ nhớ máy chủ. Màu áo chỉ thay đổi ở máy của người chơi. Đây là bản nền tảng để phát triển, chưa phải dịch vụ game công cộng hoàn chỉnh.

## Hoàng hôn và nhiệm vụ

Không gian sử dụng ánh sáng hoàng hôn. Bấm Vào chính điện để chuyển nhân vật và camera vào trong điện.

Tại hồ sen, bấm Cho cá ăn hoặc F để tung thức ăn và xem cá nhảy. Tại sân tu viện, bấm Quét lá hoặc F để dùng chổi và dọn từng cụm lá. Đứng yên đến khi thanh tiến độ hoàn thành; di chuyển hoặc chuyển khu vực sẽ hủy cử chỉ. Nhiệm vụ gồm 3 lượt cho cá ăn, 5 lượt quét lá, 3 lượt lạy trong chính điện và 1 lượt dâng nhang gần lư hương. Các mốc 3, 7, 12 lượt mở hào quang Mầm thiện (xanh), Tâm an (vàng), Sen thanh tịnh (tím). Hào quang được đồng bộ với người chơi khác; tiến độ vẫn lưu cục bộ theo trình duyệt, chưa gắn với tài khoản hoặc chống gian lận.

Kiểm tra tương tác khi máy chủ đang chạy: `node scripts/check-activities.js`.

## Bản cập nhật khuôn viên theo sơ đồ

Chính điện phía đông có nền cao, ba tầng và cầu thang có lan can cong. Nhà tăng ở phía tây, hai bảo tháp ở tây nam, hồ cá trên trục giữa, tượng Quan Âm phía sau hồ, khu phòng sư thầy ở đông bắc. Bản đồ, nhiệm vụ và di chuyển dùng chung tọa độ. Đây vẫn là bản dựng hình học cách điệu theo ảnh, không phải quét 3D thực địa.

Nhân vật mặc áo và quần lam riêng, đi chân trần trong thiết kế ban đầu. Cá koi có hoa văn, thân uốn, đuôi và vây quẫy, lượn theo đường cong với tốc độ khác nhau; vẫn nhảy khi được cho ăn. Cây dùng cụm lá nhỏ phân tầng; hồ có đá, bụi cây và thác nước.

Bốn NPC sư thầy, gồm thầy trụ trì, đi quanh sân vườn và dừng nghỉ. Đến gần để bấm trò chuyện. NPC không được tính vào số người chơi trực tuyến. Chuyển động NPC và cá chạy cục bộ ở mỗi trình duyệt.

## Chọn nhân vật theo mẫu mới

Bấm **Nhân vật** cạnh tên người chơi để chọn nữ hoặc nam, xem bốn góc và xác nhận. Nữ có tóc nâu dài tết vòng, hoa trắng, bộ lam tím với nơ và chuỗi hạt. Nam chú tiểu có tóc sát đầu, bộ lam tím, khăn vàng và chuỗi hạt. Cả hai dùng dép theo ảnh tham khảo mới, thay cho thiết kế chân đất trước đó. Đây là mô hình dựng bằng hình học theo mẫu, không phải bản quét giống từng chi tiết ảnh.

Lựa chọn được lưu trên trình duyệt và gửi tới những người chơi khác, kể cả người vào phòng sau. Đổi nhân vật không xóa nhiệm vụ hoặc hào quang đã mở. Hào quang dựng đứng trong mặt phẳng sau đầu, đi theo hướng quay của nhân vật; ba cấp màu vẫn theo mốc nhiệm vụ. Cửa sổ chọn nhân vật cho xem hào quang hiện có, không tự mở khóa cấp mới.

Kiểm tra lựa chọn, hủy, lưu lại và giao diện điện thoại: `node scripts/check-character.js`.

## Chính điện ba tầng đi được

Chính điện được dựng lại theo các ảnh kiến trúc bổ sung: khung gỗ nâu, các ô tường trắng, mái ngói xám cong nhiều lớp, đầu hồi trang trí, đèn lồng, lan can đá có ô hoa văn và cây hoa phủ mặt bệ. Lòng điện được kéo dài từ khoảng 14 lên hơn 21 đơn vị, với tường sau và vách hai bên đầy đủ, các ô cửa trang trí và hệ cột dùng chung một mô-đun để không dựng trùng. Ba tầng có sàn riêng ở cao độ 3,93 / 12,5 / 20,5 trong thế giới game; mái dưới nằm thấp hơn ban công trên, có khoảng mở dành riêng cho thang giữa để lan can không xuyên mái. Các kích thước này phục vụ trò chơi, không phải số đo thực địa.

- Cầu thang rộng phía trước dẫn từ sân lên tầng 1 có ba tượng Phật.
- Từ sân tầng 1, đi hai nhánh thang đối xứng phía trước lên cầu nối ngang, rồi tới thang giữa vào tầng 2, theo bố cục ảnh tham khảo. Từ tầng 2 lên tầng 3 cũng có hai nhánh thang ngoài, cầu nối và thang giữa; các khoảng mở trên sàn, mái và lan can giữ đường đi thông suốt. Đi ngược đường để xuống.
- Nhãn bản đồ hiển thị tầng hiện tại. Khi nhân vật vào trong phòng, mái, mặt tiền và tầng phía trên tự ẩn để không che tầm nhìn; ra ban công hoặc sân sẽ thấy lại toàn bộ kiến trúc.
- Vị trí cao độ được gửi qua WebSocket và giữ cho cả người vào phòng sau, tránh hiển thị người ở tầng trên xuống tầng dưới. Không thể bước xuyên mép sàn để nhảy tức thời giữa các tầng.

Chạy `npm test` để kiểm tra các tuyến lên/xuống cả hai bên, cao độ chiếu nghỉ, mô hình ba tầng và đồng bộ nhiều người; chạy `npm run build` để tạo bản phát hành.

Ba tượng Phật được bổ sung khuôn mặt mịn hơn, mắt khép, vành tai, tóc xoắn, bàn tay có ngón và cử chỉ khác nhau, đường viền nếp áo, ba lớp cánh sen và vòng hào quang trang trí. Đây vẫn là tượng dựng hình học, không phải ảnh chụp hay dữ liệu quét 3D.

### Ngồi bồ đoàn

Đến gần bồ đoàn trên cùng tầng (khoảng 1,3 đơn vị) để hiện nút **Ngồi vào bồ đoàn**. Bấm nút hoặc **T** để ngồi đúng tâm đệm, quay về phía bàn thờ và giữ tư thế không giới hạn thời gian. Bấm **Đứng dậy**, **T**, di chuyển hoặc thực hiện hành động khác để đứng lên. Nút cũng dùng được trên điện thoại. Tư thế ngồi được đồng bộ cho người chơi khác, kể cả người vào sau; không thay đổi nhiệm vụ hoặc vật phẩm.

Khi máy chủ đang chạy, dùng `node scripts/check-hall.js` để kiểm tra ngồi/đứng, đồng bộ tư thế và nút cảm ứng.
Chạy `node scripts/check-collision.js` để kiểm tra đường đi lên ba tầng với toàn bộ vật thể trong cảnh, mặt đứng trên bồ đoàn và va chạm tại bệ Quan Âm/lư hương.
Chạy `node scripts/check-garden.js` để kiểm tra đi qua cầu hồ, tương tác Quan Âm và nút nghi lễ trên điện thoại.

## Hồ và trang trí mới

- Hồ kéo dài 20% theo trục trước–sau (9 × 10,8 đơn vị); cầu gỗ có hai dốc lên xuống, lan can và đường đá nối tới Quan Âm. Va chạm chỉ cho đi qua nước trên cầu.
- Đến gần Quan Âm để hiện **Quỳ lễ / Lạy Quan Âm / Dâng hương**. Cũng dùng Q / E / R; lạy và dâng hương tính vào nhiệm vụ hiện có, dùng cùng kho nhang và đồng bộ hành động qua mạng.
- Tượng Quan Âm có thêm tóc, hoa tai, chi tiết mão, nếp áo, bàn tay, vân đá và lư hương nhỏ phía trước. Lư hương sân được dựng thành bát đá rỗng lòng, 28 cánh sen phù điêu và chân bát giác theo ảnh.
- Các tầng có cửa sổ cao, khoảng mở thật, ô chớp trên và cánh gỗ nan; thêm cờ Phật đản cùng đèn lồng quanh mái hiên. Bồ đoàn tăng lên 28 chỗ ở tầng 1 và 10 chỗ ở tầng 2, giữ lối giữa phía trước.
- Cây được lọc theo khoảng chiếm chỗ của tán với mái, sàn và hành lang để loại các vị trí đâm vào nhà.

## Mái, ánh sáng và chuyển động cập nhật

Tầng 1 được mở rộng thành mặt bằng khoảng 23,76 × 50,3 đơn vị, đồng bộ sàn, bệ, tường, mái và lan can. Bề ngang thu nhỏ thêm 10% từ 26,4 xuống 23,76 đơn vị, giữ chiều dài đã tăng thêm 5,6 đơn vị về phía sân trước; hai nhánh thang và cầu ngang thu vào đồng bộ, không giảm bề rộng lối thang; mái che kéo dài tương ứng, đua 1,7 đơn vị hai bên và khoét thoáng lối thang giữa. Hai nhánh thang tầng 1–2 đối xứng hai bên sân, nối vào cầu ngang, rồi nối thang giữa rộng 7,4 đơn vị theo ảnh bố cục chữ U. Đầu thang giữa nối trực tiếp vào mép ngoài sàn tầng 2, giống kết nối tầng 2–3; sàn không còn bị khoét lỗ thang bên trong. Lan can mở dư 0,7 đơn vị mỗi bên miệng thang, lan can dốc chạy hết chân/đỉnh thang và có đoạn nối sang lan can sàn, không để hụt hai đầu. Chiếu nghỉ sâu 2,8 đơn vị và dải sàn rộng 1,2 đơn vị trước chân thang tạo lối đi ngang/rẽ lên xuống không xuyên lan can. Các nhánh tầng 2–3 được dịch vào trong để tách khỏi lan can biên. Cầu thang và cầu ngang nằm ngoài mặt tiền; lư hương dịch ra sân trước để không nằm trong bậc thềm. Các số đo là đơn vị game, không phải số đo thực địa.

Quan Âm nằm trên cùng trục giữa với hồ cá. Cá koi có thân thuôn, màu loang chuyển mềm, vây ngực, vây lưng và đuôi hai thùy biến dạng liên tục theo nhịp bơi.

Nhân vật có va chạm bán kính 0,22 đơn vị với các khối vật thể tĩnh (cột, lan can, bệ tượng, lư hương, cây, đá và công trình). Chuyển động chia bước nhỏ để không vượt qua vật cản mỏng. Nệm có ba cao độ 0,06 / 0,18 / 0,36 đơn vị; đứng hoặc ngồi trên nệm được nâng lên đúng mặt nệm, đồng bộ cao độ với người chơi khác. Các bệ thấp có mặt đứng riêng, thay vì cho chân đi xuyên qua.

Quan Âm ngoài sân được tạo dáng ngồi tự tại theo ảnh tham khảo: chân co và chân buông, một tay đặt trên gối, một tay chống bệ đá, áo trắng rủ nếp, mão cánh sen và chuỗi anh lạc. Tượng là mô hình 3D dựng bằng hình học, không dùng ảnh phẳng thay tượng.

Nhân vật luôn thu nhỏ đồng đều trên cả ba trục (`0.7 / 0.7 / 0.7`), kể cả khi ngồi, quỳ và lạy. Các tư thế dùng khớp hông, gối, cổ chân, gập thân và khuỷu tay; không ép chiều cao toàn mô hình. Nhấn **Q** để hạ gối/chắp tay, **E** để quỳ → cúi lạy → đứng lên. Người chơi từ xa cũng được cập nhật tư thế mỗi khung hình. Chạy `node scripts/check-poses.js` để kiểm tra hình học và dựng ảnh đối chiếu các tư thế nam/nữ tại `/tmp/khanh-an-postures.png`.

- Chóp mái hai mặt dốc trên lớp mái hông, sống nóc ngang và hai đầu cong nhẹ theo ảnh tham khảo. Lan can đá chạm ô mây bao quanh ban công, cầu nối và hai bên cầu thang.
- Tầng 2 và 3 có thêm ban Phật với tượng, bàn lễ và nến. Mỗi tầng có hai đèn lồng phát sáng thật bằng PointLight, ánh sáng ấm cố định, không nhấp nháy.
- Nhân vật người chơi và NPC được thu nhỏ còn 70%; tốc độ đi bộ tăng từ 2,6 lên 3,38 đơn vị/giây (+30%). Tăng/giảm tốc, quay người và vung tay chân mượt hơn; chạy chéo không làm tăng tốc. Màn hình chọn nhân vật vẫn dùng kích thước xem trước dễ quan sát.
- Tường bao quanh bốn cạnh khuôn viên, chừa cổng chính. Va chạm giữ người chơi bên trong tường.
- Cổng tam quan đặt ngay trên mép tường bao phía trước: ba mái ngói xám, trụ và đấu kê màu đá, biển gỗ chữ thư pháp vàng. Hai cửa phụ đóng; cửa chính mở vào sân để giữ lối giữa thông thoáng. Mô hình dựng theo ảnh tham chiếu, không phải bản đo kiến trúc.
- Sân ngoài dùng một lớp gạch instanced duy nhất; bỏ các mặt nền/lối đi đồng cao độ gây z-fighting và nhấp nháy màu.
## Đồ họa và hiệu năng

- Chọn **Tự động / Mượt / Cân bằng / Đẹp** trong mục **Đồ họa**, phía dưới bản đồ. Lựa chọn được lưu trên thiết bị.
- **Tự động** điều chỉnh độ phân giải dựng hình theo tốc độ khung hình, có khoảng nghỉ giữa các lần điều chỉnh. Chỉ số FPS trên máy tính là số đo tại thiết bị hiện tại, không phải mức FPS bảo đảm.
- **Mượt** giảm độ phân giải, tắt bóng đổ và các nguồn sáng điểm; hình đèn lồng vẫn giữ lại. Các chế độ còn lại giữ nguồn sáng và thay đổi độ phân giải bóng đổ.
- Lá sân là các lá mỏng xanh–vàng rải đều trong khuôn viên, tránh hồ và nền công trình; dùng một `InstancedMesh`, không bóng đổ, không cập nhật ma trận khi đứng yên. Quét lá được ở sân ngoài, chỉ gom/xóa lá gần nhân vật và di chuyển sẽ hủy quét; tiến độ nhiệm vụ cũ không làm biến mất toàn bộ lớp lá trang trí. Kiểm tra bằng `test/courtyard-leaves.test.js` và `scripts/check-courtyard-leaves.js` (hỗ trợ `GAME_URL`).
- Hoành phi chính điện dùng font thư pháp Charm có sẵn trong dự án, viền kép và họa tiết sen/mây vẽ vào texture tĩnh. Dành khoảng trống giữa mặt tiền cho bảng tên, không treo cờ hay đèn trong phạm vi này; không thêm nguồn sáng hoặc hoạt ảnh để trang trí bảng.
- Các chi tiết tĩnh được gộp theo vật liệu, nhóm hiển thị và ô không gian. Không gộp nhân vật, cá, nước trong suốt hoặc các nhóm tầng khác nhau. Dữ liệu va chạm được tạo trước khi gộp, nên hình học đi bộ không đổi.
- Thông tin vị trí và chấm bản đồ cập nhật tối đa khoảng 8 lần/giây; chuyển động và hoạt ảnh vẫn cập nhật mỗi khung hình.
- Kiểm tra đồ họa trên bản production đang chạy: `node scripts/check-graphics.js`. Có thể đặt `GAME_URL` để kiểm tra địa chỉ khác. Phép đo headless dùng để so sánh trên cùng môi trường, không đại diện cho mọi điện thoại/máy tính.
## Nhà tăng theo ảnh tham chiếu

- Thay khối nhà đơn giản bằng nhà hai tầng có trục dài, khung cột đỏ, tường gạch nung, cửa gỗ, cửa sổ tròn và ban công đá chạm mây bao quanh.
- Mái ngói xám gồm mái dốc hai mặt, diềm mái bốn góc cong, đầu hồi sọc trắng đỏ và phù điêu sen vàng. Trên mái có lầu nhỏ phía trước và tháp hai lớp mái phía sau với bảo đỉnh vàng nhiều vòng.
- Đèn lồng trắng và cờ Phật đản bổ sung theo ảnh. Không thêm nguồn sáng điểm mới; các chi tiết tĩnh vẫn dùng cơ chế gộp để giảm lượt vẽ.
- Nhấn **Nhà tăng** trong mục **Ghé thăm** để xem toàn cảnh. Di chuyển sẽ trở lại góc nhìn theo nhân vật. Bậc, hành lang và các cửa mở tầng dưới đi được; không gian bên trong tầng dưới chưa bố trí nội thất, tầng trên chưa có lối lên tham quan.
- Mô hình dựng theo các ảnh cung cấp, không phải bản đo đạc kiến trúc hoặc mô hình quét 3D.
- Kiểm tra: `node --test test/residence.test.js` và `node scripts/check-residence.js`; script giao diện hỗ trợ biến `GAME_URL`.
## Bố cục nhà tăng và sân vườn cập nhật

- Nhà tăng xoay 90°: tháp cao bên trái, dãy nhà dài và lầu nhỏ bên phải khi nhìn từ sân. Hình học, khoảng tránh cây, cao độ sàn, cửa và va chạm dùng cùng hệ tọa độ xoay.
- Ba bộ cửa hai cánh mở ở tầng dưới cho phép đi qua; cờ Phật giáo treo cách tường dưới diềm mái, không dán lên tường gạch.
- Hoán đổi vị trí chuông và bảo tháp, cập nhật cả nút ghé thăm và bản đồ. Cụm bảo tháp mới có trụ đá xếp lớp, cửa song đỏ, mái ngói bốn góc cong và chóp vàng theo ảnh cung cấp.
- Bia đá bên lối đi mang dòng chữ **Tu Viện Khánh An**, trình bày bốn dòng bằng phông Charm có hỗ trợ tiếng Việt. Phông được phục vụ nội bộ tại `public/fonts/Charm-Bold.ttf`; giấy phép SIL Open Font License đi kèm ở `public/fonts/Charm-OFL.txt`. Cây và đèn sân gần bia được chừa khoảng để không che chữ.
- Bia được chuyển sang khoảng sân bên trái chân thang chính theo ảnh vị trí nhân vật; bỏ cụm lá và hoa lơ lửng xuyên ra mặt tường chân chính điện.
- Tường sau ban Phật tầng 2–3 liền kín từ sàn tới xà; thêm phù điêu Pháp luân tám nan và hoa sen. Tường vẫn chặn di chuyển khi các phần mái phía trước được ẩn để nhìn vào phòng.
- Kiểm tra riêng: `node --test test/campus-revision.test.js test/residence.test.js`; kiểm tra toàn cảnh: `node scripts/check-campus-revision.js` (hỗ trợ `GAME_URL` cho bản public).

## Chuông, nghi thức và bầu trời

- Bia đá lùi về gần tường chân tầng 1; giữ lối giữa sân và chân cầu thang thông thoáng.
- Tháp chuông dùng bốn cột gỗ, tầng ô cửa tròn, mái ngói bốn góc vút, đại hồng chung và dùi treo theo ảnh tham chiếu. Đến gần và nhấn **C** hoặc **Thỉnh chuông**; mỗi lượt cách ít nhất 5 giây trên giao diện. Máy chủ kiểm tra khoảng cách và giới hạn 4,5 giây cho cả phòng; tiếng chuông và dùi chuyển động đồng bộ, âm lượng giảm theo khoảng cách người nghe.
- Âm chuông và âm lễ quỳ/lạy/dâng nhang được tổng hợp nội bộ, không dùng bản thu YouTube. Nhạc và hiệu ứng tắt riêng; trình duyệt vẫn có thể yêu cầu một thao tác trước khi cho phát âm thanh.
- Dâng nhang hiển thị ba nén trên tay, đưa tay và cúi thân nhẹ; tám billboard khói tái sử dụng, chỉ hiển thị trong nghi thức. Người chơi khác nhìn thấy cùng đạo cụ qua trạng thái hoạt ảnh.
- Bầu trời có 16 billboard mây dùng chung một texture, không thêm đèn, bóng đổ hoặc va chạm.
- Kiểm tra: `node --test test/temple-atmosphere.test.js test/multiplayer.test.js` và `node scripts/check-temple-atmosphere.js`.

### Điều chỉnh chuông và cầu thang

- Dùi gỗ treo theo hướng vào tâm chuông; mái tháp bốn mặt hội tụ về chóp nhọn, bổ sung cột nối và kèo gỗ sát dưới mái.
- Quỳ, lạy và dâng nhang phát tiếng chuông ngân cùng bộ họa âm với đại hồng chung, ở mức nhẹ hơn. Nhạc nền YouTube có thanh điều chỉnh âm lượng và có thanh **Âm lượng nhạc** trong thẻ bản đồ; lưu mức âm và giữ nguyên tùy chọn tắt nhạc/âm lễ.
- Hai nhánh thang xéo mỗi tầng rút chân vào thêm 1,2 đơn vị: khoảng trước chân thang tăng từ 1,2 lên 2,4; lối cạnh ngoài thang tăng từ 0,8 lên 1,6. Giữ nguyên chiếu nghỉ, thang chính và bề ngang tòa nhà.
- Cao độ di chuyển trên thang dùng mặt dốc chung trong `world-layout.js`; bỏ va chạm hộp riêng của từng bậc để không kẹt trên thang ngắn, vẫn giữ va chạm lan can, tường và vật thể khác.

### Bàn tay và tư thế thiền

- Bàn tay nam/nữ có cổ tay, lòng bàn tay, bốn ngón có đốt và ngón cái riêng; ngón tay khép nhẹ khi nghỉ và co để giữ nhang. Điều chỉnh chiều dài cánh tay cùng bộ giải khớp khuỷu, không thay tỷ lệ toàn thân.
- Tràng hạt ẩn suốt động tác dâng nhang và xuất hiện lại khi đổi sang hành động khác, áp dụng cả người chơi từ xa.
- Ngồi bồ đoàn theo dáng xếp bằng: mở hai gối, gập cẳng chân vào trong, bàn chân hướng chéo nhau, lưng thẳng và hai tay nghỉ trên gối với lòng bàn tay ngửa. Đứng dậy trả lại vị trí thân và khớp ban đầu.
- Kiểm tra: `node --test test/character-pose.test.js`, `node scripts/check-character-hands.js` và `node scripts/check-hall.js`. Script kiểm tra bồ đoàn hỗ trợ `GAME_URL` cho host công khai.

### Tháp riêng, mái kín và vườn cá

- Tháp nhà tăng tách thành khối ba tầng bên trái dãy nhà, bắt đầu từ cao độ sàn tầng 2; sân tầng 2 mở rộng, cửa sau và lối hiên nối hai khối. Dãy nhà chính rút về ba gian để mái không xuyên vào tháp.
- Diềm tường nhà tăng và bảo tháp bám theo đúng đường cong mái bằng các mặt khép kín; bổ sung phần chụp giữa mái bảo tháp. Các bảng “LÊN TẦNG” được gỡ, không đổi tuyến cầu thang.
- Khi cho ăn, cá ngoi lên nhẹ tới mặt nước, giữ chuyển động bơi mềm và hiện trái tim billboard phía trên đầu; không còn hoạt ảnh nhảy. Cả đàn dùng chung một texture trái tim.
- Hàng bảy cây tùng Nhật chibi đặt sau Quan Âm; dùng chung một texture trong suốt vẽ nội bộ, không thêm bóng đổ hay đèn. Mô hình cây là billboard, không phải cây 3D nhiều lá.
- Nhạc nền phát trực tiếp qua YouTube IFrame API, không tải/tách âm thanh. Khung phát chỉ ẩn sau khi nhạc đã được tạm dừng bằng ♫; giữ điều khiển phát, âm lượng và liên kết mở bản gốc. API hoặc video có thể bị chặn bởi mạng/trình duyệt; thông báo trong khung cho biết cách mở thủ công.
- Kiểm tra điều khiển nhạc trong `scripts/check-temple-atmosphere.js` dùng API giả lập; các kiểm tra phát âm chuông/nghi lễ vẫn dùng Web Audio thật trong Chromium.

### Tên, lời thoại và hành lang

- HUD chia thành hai cột theo chiều cao màn hình: nhiệm vụ và chat bên trái; bản đồ, danh sách dịch chuyển cuộn riêng và chọn nhân vật bên phải. Các khung không dùng tọa độ độc lập nên không đè nhau khi thu/phóng màn hình; màn hình ngang rất thấp ẩn bản đồ để ưu tiên các nút. Kiểm tra bằng `node scripts/check-hud-layout.js`, hỗ trợ `GAME_URL`, với 7 kích thước và cả trạng thái chat đóng/mở, trong/ngoài chính điện.

- Hiện tên nhân vật chính, người chơi khác và bốn NPC phía trên đầu. Nhãn dùng lớp DOM chiếu theo camera, bám theo đầu cả khi quỳ/lạy/ngồi; không tạo texture mới mỗi khung hình. Đổi ngoại hình giữ nhãn, đổi tên cập nhật nhãn; người rời phòng được dọn nhãn và tài nguyên nhân vật.
- Tin nhắn máy chủ có `playerId` để xác định đúng người nói, kể cả khi trùng tên. Nội dung chat hiện nguyên văn trên đầu người gửi trong 5 giây rồi ẩn; lịch sử trong khung chat vẫn giữ. Hiển thị bằng `textContent`, không diễn giải HTML.
- NPC tự chào hoặc chúc an lành khi người chơi đến gần, có khoảng nghỉ ít nhất 22 giây giữa hai lời tự động. Nút trò chuyện cũng phát lời thoại trên đầu. Chữ xuất hiện dần trong tổng thời gian hiển thị 5 giây.
- Đầu cột đỡ chiếu nghỉ dừng dưới đáy bản sàn, không còn mặt gỗ trùng cao độ mặt sàn phía trên.
- Hai hành lang sân giữ nguyên vị trí và lối đi giữa: cột son, khung xanh ngọc, song kỷ hà màu kem, hoành phi sơn thủy lặp theo từng gian, trần gỗ và mái ngói cong. Sàn dùng một khối có texture đá; các chi tiết tĩnh vẫn được gộp hình.
- Kiểm tra: `test/character-labels.test.js`, `test/covered-corridor.test.js`, `test/hall.test.js`, `test/multiplayer.test.js`; kiểm tra hai trình duyệt: `node scripts/check-character-labels.js` (hỗ trợ `GAME_URL`), cùng `scripts/check-collision.js` và `scripts/check-hall.js`.
