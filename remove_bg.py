import sys
try:
    from PIL import Image
    import numpy as np
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow', 'numpy'])
    from PIL import Image
    import numpy as np

def remove_bg():
    img = Image.open('public/icon.png').convert('RGBA')
    data = np.array(img)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    threshold = 240
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)
    data[white_mask, 3] = 0
    
    for t in range(200, 241):
        partial_mask = (r > t) & (g > t) & (b > t) & ~white_mask
        factor = (255 - t) / (255 - 200)
        data[partial_mask, 3] = (data[partial_mask, 3] * factor).astype(np.uint8)
        
    result = Image.fromarray(data)
    result.save('public/icon_transparent.png', 'PNG')
    print('Done!')

remove_bg()
